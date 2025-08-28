import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  teams: defineTable({
    // From API - stable identifiers
    apiId: v.number(), // ID from collegefootballdata API
    school: v.string(),
    conference: v.optional(v.string()),
    division: v.string(), // "fbs" or "fcs"
    
    // Current season stats (updated as games complete)
    wins: v.number(),
    losses: v.number(),
    conferenceWins: v.number(),
    conferenceLosses: v.number(),
    
    // Metadata
    season: v.number(),
    lastUpdated: v.string(), // ISO timestamp
  }).index("by_api_id", ["apiId"])
    .index("by_school", ["school"])
    .index("by_conference", ["conference"])
    .index("by_season", ["season"]),

  games: defineTable({
    // From API
    apiId: v.number(),
    season: v.number(),
    week: v.number(),
    seasonType: v.string(), // "regular" or "postseason"
    startDate: v.string(), // ISO timestamp
    
    // Team references (using API IDs)
    homeTeamId: v.number(),
    homeTeam: v.string(), // School name for display
    awayTeamId: v.number(),
    awayTeam: v.string(), // School name for display
    
    // Game state
    completed: v.boolean(),
    homePoints: v.optional(v.number()),
    awayPoints: v.optional(v.number()),
    
    // Conference game tracking
    conferenceGame: v.boolean(),
    
    // Metadata
    lastUpdated: v.string(),
  }).index("by_api_id", ["apiId"])
    .index("by_season_week", ["season", "week"])
    .index("by_home_team", ["homeTeamId", "season"])
    .index("by_away_team", ["awayTeamId", "season"])
    .index("by_team", ["homeTeamId"]) // For getting all games
    .index("by_team_away", ["awayTeamId"]), // For getting all games

  conferences: defineTable({
    // Simple conference tracking
    name: v.string(),
    abbreviation: v.optional(v.string()),
    season: v.number(),
  }).index("by_name", ["name"])
    .index("by_season", ["season"]),

  // Track sync status to know when data was last updated
  syncLog: defineTable({
    syncType: v.string(), // "teams", "games_week_X", "full_season"
    season: v.number(),
    week: v.optional(v.number()),
    status: v.string(), // "started", "completed", "failed"
    startTime: v.string(),
    endTime: v.optional(v.string()),
    recordsProcessed: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  }).index("by_type_season", ["syncType", "season"])
    .index("by_status", ["status"]),
});