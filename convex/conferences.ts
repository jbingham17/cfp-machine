import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all conferences for a season
export const list = query({
  args: {
    season: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentSeason = args.season || new Date().getFullYear();
    
    const conferences = await ctx.db
      .query("conferences")
      .withIndex("by_season", (q) => q.eq("season", currentSeason))
      .collect();
    
    return conferences.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get unique conference names from teams
export const getActiveConferences = query({
  args: {
    season: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentSeason = args.season || new Date().getFullYear();
    
    // Get all teams for the season
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_season", (q) => q.eq("season", currentSeason))
      .collect();
    
    // Extract unique conferences that actually have teams
    const conferenceSet = new Set<string>();
    teams.forEach(team => {
      if (team.conference) {
        conferenceSet.add(team.conference);
      }
    });
    
    // Convert to array and sort
    return Array.from(conferenceSet).sort();
  },
});

// Upsert a conference
export const upsertConference = mutation({
  args: {
    name: v.string(),
    abbreviation: v.optional(v.string()),
    season: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if conference exists for this season
    const existing = await ctx.db
      .query("conferences")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .filter((q) => q.eq(q.field("season"), args.season))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("conferences", args);
    }
  },
});