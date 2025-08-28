import { action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Main sync action that orchestrates everything
export const syncCurrentSeason = action({
  args: {
    season: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    // Season is the year if we're past June, otherwise previous year
    const season = args.season || (currentMonth > 6 ? currentYear : currentYear - 1);
    
    console.log(`Starting sync for ${season} season`);
    
    // Log sync start
    await ctx.runMutation(internal.sync.logSync, {
      syncType: "full_season",
      season,
      status: "started",
      startTime: new Date().toISOString(),
    });

    try {
      // 1. Sync all FBS teams with initial records
      await ctx.runAction(internal.sync.syncTeams, { season });
      
      // 2. Sync all games for the season
      await ctx.runAction(internal.sync.syncAllGames, { season });
      
      // 3. Calculate and update team records based on completed games
      await ctx.runAction(internal.sync.calculateTeamRecords, { season });
      
      // Log successful completion
      await ctx.runMutation(internal.sync.logSync, {
        syncType: "full_season",
        season,
        status: "completed",
        endTime: new Date().toISOString(),
      });
      
      return { success: true, season };
    } catch (error) {
      // Log error
      await ctx.runMutation(internal.sync.logSync, {
        syncType: "full_season",
        season,
        status: "failed",
        endTime: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw error;
    }
  },
});

// Sync teams from API
export const syncTeams = internalAction({
  args: {
    season: v.number(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.CFB_API_KEY;
    if (!apiKey) {
      throw new Error("CFB_API_KEY not configured");
    }

    // Fetch teams from API
    const response = await fetch(
      `https://apinext.collegefootballdata.com/teams/fbs?year=${args.season}`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }

    const teams = await response.json();
    
    // Upsert each team with initial 0-0 record
    for (const team of teams) {
      await ctx.runMutation(internal.teams.upsertTeam, {
        apiId: team.id,
        school: team.school,
        conference: team.conference || "Independent",
        division: "fbs",
        wins: 0,
        losses: 0,
        conferenceWins: 0,
        conferenceLosses: 0,
        season: args.season,
      });
    }

    console.log(`Synced ${teams.length} teams for ${args.season}`);
    return { count: teams.length };
  },
});

// Sync all games for a season
export const syncAllGames = internalAction({
  args: {
    season: v.number(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.CFB_API_KEY;
    if (!apiKey) {
      throw new Error("CFB_API_KEY not configured");
    }

    // Fetch all games for the season (FBS only)
    const response = await fetch(
      `https://apinext.collegefootballdata.com/games?year=${args.season}&division=fbs`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`);
    }

    const games = await response.json();
    
    let processedCount = 0;
    
    for (const game of games) {
      // Skip games without both team IDs
      if (!game.home_id || !game.away_id) {
        continue;
      }

      await ctx.runMutation(internal.games.upsertGame, {
        apiId: game.id,
        season: game.season,
        week: game.week,
        seasonType: game.season_type,
        startDate: game.start_date,
        homeTeamId: game.home_id,
        homeTeam: game.home_team,
        awayTeamId: game.away_id,
        awayTeam: game.away_team,
        completed: game.completed,
        homePoints: game.home_points,
        awayPoints: game.away_points,
        conferenceGame: game.conference_game || false,
      });
      
      processedCount++;
    }

    console.log(`Synced ${processedCount} games for ${args.season}`);
    return { count: processedCount };
  },
});

// Calculate team records from completed games
export const calculateTeamRecords = internalAction({
  args: {
    season: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all teams for the season
    const teams = await ctx.runQuery("teams:list", { season: args.season });
    
    // Reset all team records to 0-0
    for (const team of teams) {
      await ctx.runMutation(internal.teams.upsertTeam, {
        apiId: team.apiId,
        school: team.school,
        conference: team.conference,
        division: team.division,
        wins: 0,
        losses: 0,
        conferenceWins: 0,
        conferenceLosses: 0,
        season: args.season,
      });
    }
    
    // Get all completed games
    const games = await ctx.runQuery("games:getByWeek", { 
      season: args.season, 
      week: 0 // This won't work, need a different query
    });
    
    // Actually, let's create a helper to get all games for a season
    // For now, we'll process week by week
    for (let week = 0; week <= 15; week++) {
      const weekGames = await ctx.runQuery("games:getByWeek", { 
        season: args.season, 
        week 
      });
      
      for (const game of weekGames) {
        if (game.completed && game.homePoints !== undefined && game.awayPoints !== undefined) {
          const homeWon = game.homePoints > game.awayPoints;
          
          // Update home team
          await ctx.runMutation(internal.teams.updateTeamRecord, {
            apiId: game.homeTeamId,
            season: args.season,
            addWin: homeWon,
            isConferenceGame: game.conferenceGame,
          });
          
          // Update away team
          await ctx.runMutation(internal.teams.updateTeamRecord, {
            apiId: game.awayTeamId,
            season: args.season,
            addWin: !homeWon,
            isConferenceGame: game.conferenceGame,
          });
        }
      }
    }
    
    console.log(`Updated records for all teams in ${args.season}`);
  },
});

// Sync a specific week's games
export const syncWeekGames = action({
  args: {
    season: v.number(),
    week: v.number(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.CFB_API_KEY;
    if (!apiKey) {
      throw new Error("CFB_API_KEY not configured");
    }

    await ctx.runMutation(internal.sync.logSync, {
      syncType: `games_week_${args.week}`,
      season: args.season,
      week: args.week,
      status: "started",
      startTime: new Date().toISOString(),
    });

    try {
      const response = await fetch(
        `https://apinext.collegefootballdata.com/games?year=${args.season}&week=${args.week}&division=fbs`,
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const games = await response.json();
      let processedCount = 0;

      for (const game of games) {
        if (!game.home_id || !game.away_id) continue;

        await ctx.runMutation(internal.games.upsertGame, {
          apiId: game.id,
          season: game.season,
          week: game.week,
          seasonType: game.season_type,
          startDate: game.start_date,
          homeTeamId: game.home_id,
          homeTeam: game.home_team,
          awayTeamId: game.away_id,
          awayTeam: game.away_team,
          completed: game.completed,
          homePoints: game.home_points,
          awayPoints: game.away_points,
          conferenceGame: game.conference_game || false,
        });
        
        processedCount++;
      }

      await ctx.runMutation(internal.sync.logSync, {
        syncType: `games_week_${args.week}`,
        season: args.season,
        week: args.week,
        status: "completed",
        endTime: new Date().toISOString(),
        recordsProcessed: processedCount,
      });

      return { success: true, count: processedCount };
    } catch (error) {
      await ctx.runMutation(internal.sync.logSync, {
        syncType: `games_week_${args.week}`,
        season: args.season,
        week: args.week,
        status: "failed",
        endTime: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw error;
    }
  },
});

// Log sync operations
export const logSync = internalMutation({
  args: {
    syncType: v.string(),
    season: v.number(),
    week: v.optional(v.number()),
    status: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    recordsProcessed: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find existing log entry
    const existing = await ctx.db
      .query("syncLog")
      .withIndex("by_type_season", (q) => 
        q.eq("syncType", args.syncType).eq("season", args.season)
      )
      .filter((q) => 
        args.week ? q.eq(q.field("week"), args.week) : q.eq(q.field("week"), undefined)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        endTime: args.endTime,
        recordsProcessed: args.recordsProcessed,
        errorMessage: args.errorMessage,
      });
    } else {
      await ctx.db.insert("syncLog", {
        syncType: args.syncType,
        season: args.season,
        week: args.week,
        status: args.status,
        startTime: args.startTime || new Date().toISOString(),
        endTime: args.endTime,
        recordsProcessed: args.recordsProcessed,
        errorMessage: args.errorMessage,
      });
    }
  },
});