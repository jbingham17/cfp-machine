import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get games for a specific week
export const getByWeek = query({
  args: {
    season: v.number(),
    week: v.number(),
  },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_season_week", (q) => 
        q.eq("season", args.season).eq("week", args.week)
      )
      .collect();
    
    // Sort by date, then by home team name
    return games.sort((a, b) => {
      const dateCompare = a.startDate.localeCompare(b.startDate);
      if (dateCompare !== 0) return dateCompare;
      return a.homeTeam.localeCompare(b.homeTeam);
    });
  },
});

// Get all games for a team in a season
export const getByTeam = query({
  args: {
    teamId: v.number(),
    season: v.number(),
  },
  handler: async (ctx, args) => {
    // Get games where team is home
    const homeGames = await ctx.db
      .query("games")
      .withIndex("by_home_team", (q) => 
        q.eq("homeTeamId", args.teamId).eq("season", args.season)
      )
      .collect();
    
    // Get games where team is away
    const awayGames = await ctx.db
      .query("games")
      .withIndex("by_away_team", (q) => 
        q.eq("awayTeamId", args.teamId).eq("season", args.season)
      )
      .collect();
    
    // Combine and sort by week
    const allGames = [...homeGames, ...awayGames];
    return allGames.sort((a, b) => a.week - b.week);
  },
});

// Get upcoming games (not completed)
export const getUpcoming = query({
  args: {
    season: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_season_week")
      .filter((q) => 
        q.and(
          q.eq(q.field("season"), args.season),
          q.eq(q.field("completed"), false)
        )
      )
      .collect();
    
    // Sort by date
    const sorted = games.sort((a, b) => a.startDate.localeCompare(b.startDate));
    
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  },
});

// Get games by conference (both teams in same conference)
export const getConferenceGames = query({
  args: {
    conference: v.string(),
    season: v.number(),
  },
  handler: async (ctx, args) => {
    // First get all teams in the conference
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_conference", (q) => q.eq("conference", args.conference))
      .filter((q) => q.eq(q.field("season"), args.season))
      .collect();
    
    const teamIds = new Set(teams.map(t => t.apiId));
    
    // Get all games involving these teams
    const games = await ctx.db
      .query("games")
      .withIndex("by_season_week")
      .filter((q) => q.eq(q.field("season"), args.season))
      .collect();
    
    // Filter to only conference games (both teams in conference)
    return games.filter(game => 
      teamIds.has(game.homeTeamId) && 
      teamIds.has(game.awayTeamId) &&
      game.conferenceGame
    );
  },
});

// Upsert a game
export const upsertGame = mutation({
  args: {
    apiId: v.number(),
    season: v.number(),
    week: v.number(),
    seasonType: v.string(),
    startDate: v.string(),
    homeTeamId: v.number(),
    homeTeam: v.string(),
    awayTeamId: v.number(),
    awayTeam: v.string(),
    completed: v.boolean(),
    homePoints: v.optional(v.number()),
    awayPoints: v.optional(v.number()),
    conferenceGame: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if game exists
    const existing = await ctx.db
      .query("games")
      .withIndex("by_api_id", (q) => q.eq("apiId", args.apiId))
      .first();

    const gameData = {
      ...args,
      lastUpdated: new Date().toISOString(),
    };

    if (existing) {
      // Check if game result changed (was not completed, now is)
      const wasCompleted = existing.completed;
      const isNowCompleted = args.completed;
      
      await ctx.db.patch(existing._id, gameData);
      
      // If game just completed, update team records
      if (!wasCompleted && isNowCompleted && args.homePoints !== undefined && args.awayPoints !== undefined) {
        // Determine winner
        const homeWon = args.homePoints > args.awayPoints;
        
        // Update home team record
        await ctx.runMutation("teams:updateTeamRecord", {
          apiId: args.homeTeamId,
          season: args.season,
          addWin: homeWon,
          isConferenceGame: args.conferenceGame,
        });
        
        // Update away team record
        await ctx.runMutation("teams:updateTeamRecord", {
          apiId: args.awayTeamId,
          season: args.season,
          addWin: !homeWon,
          isConferenceGame: args.conferenceGame,
        });
      }
      
      return existing._id;
    } else {
      return await ctx.db.insert("games", gameData);
    }
  },
});