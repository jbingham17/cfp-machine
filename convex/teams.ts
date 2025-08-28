import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all teams for current season, optionally filtered by conference
export const list = query({
  args: {
    conference: v.optional(v.string()),
    season: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentSeason = args.season || new Date().getFullYear();
    
    let teamsQuery = ctx.db
      .query("teams")
      .withIndex("by_season", (q) => q.eq("season", currentSeason));
    
    const teams = await teamsQuery.collect();
    
    // Filter by conference if provided
    const filteredTeams = args.conference 
      ? teams.filter(t => t.conference === args.conference)
      : teams;
    
    // Sort by conference record, then overall record
    return filteredTeams.sort((a, b) => {
      // First by conference wins
      if (b.conferenceWins !== a.conferenceWins) {
        return b.conferenceWins - a.conferenceWins;
      }
      // Then by conference losses (fewer is better)
      if (a.conferenceLosses !== b.conferenceLosses) {
        return a.conferenceLosses - b.conferenceLosses;
      }
      // Then by overall wins
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      // Then by overall losses
      if (a.losses !== b.losses) {
        return a.losses - b.losses;
      }
      // Finally alphabetically
      return a.school.localeCompare(b.school);
    });
  },
});

// Get a single team by API ID
export const getByApiId = query({
  args: { 
    apiId: v.number(),
    season: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentSeason = args.season || new Date().getFullYear();
    
    const team = await ctx.db
      .query("teams")
      .withIndex("by_api_id", (q) => q.eq("apiId", args.apiId))
      .filter((q) => q.eq(q.field("season"), currentSeason))
      .first();
    
    return team;
  },
});

// Get conference standings
export const getConferenceStandings = query({
  args: {
    conference: v.string(),
    season: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentSeason = args.season || new Date().getFullYear();
    
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_conference", (q) => q.eq("conference", args.conference))
      .filter((q) => q.eq(q.field("season"), currentSeason))
      .collect();
    
    // Sort by conference record for standings
    return teams.sort((a, b) => {
      if (b.conferenceWins !== a.conferenceWins) {
        return b.conferenceWins - a.conferenceWins;
      }
      if (a.conferenceLosses !== b.conferenceLosses) {
        return a.conferenceLosses - b.conferenceLosses;
      }
      // Tiebreaker: overall record
      const aWinPct = a.wins / (a.wins + a.losses || 1);
      const bWinPct = b.wins / (b.wins + b.losses || 1);
      return bWinPct - aWinPct;
    });
  },
});

// Upsert a team (create or update)
export const upsertTeam = mutation({
  args: {
    apiId: v.number(),
    school: v.string(),
    conference: v.optional(v.string()),
    division: v.string(),
    wins: v.number(),
    losses: v.number(),
    conferenceWins: v.number(),
    conferenceLosses: v.number(),
    season: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if team exists for this season
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_api_id", (q) => q.eq("apiId", args.apiId))
      .filter((q) => q.eq(q.field("season"), args.season))
      .first();

    const teamData = {
      ...args,
      lastUpdated: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, teamData);
      return existing._id;
    } else {
      return await ctx.db.insert("teams", teamData);
    }
  },
});

// Update team record after a game result
export const updateTeamRecord = mutation({
  args: {
    apiId: v.number(),
    season: v.number(),
    addWin: v.boolean(),
    isConferenceGame: v.boolean(),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_api_id", (q) => q.eq("apiId", args.apiId))
      .filter((q) => q.eq(q.field("season"), args.season))
      .first();
    
    if (!team) {
      throw new Error(`Team with API ID ${args.apiId} not found for season ${args.season}`);
    }

    const updates: any = {
      lastUpdated: new Date().toISOString(),
    };

    if (args.addWin) {
      updates.wins = team.wins + 1;
      if (args.isConferenceGame) {
        updates.conferenceWins = team.conferenceWins + 1;
      }
    } else {
      updates.losses = team.losses + 1;
      if (args.isConferenceGame) {
        updates.conferenceLosses = team.conferenceLosses + 1;
      }
    }

    await ctx.db.patch(team._id, updates);
  },
});