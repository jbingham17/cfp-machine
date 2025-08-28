# Convex Backend

This directory contains the Convex backend configuration for CFP Machine.

## Setup

1. Run `npx convex dev` to set up your Convex project
2. Follow the prompts to create a new project or link to an existing one
3. The schema and functions defined here will be automatically deployed

## Files

- `schema.ts` - Database schema definitions
- `teams.ts` - Team-related queries and mutations
- `conferences.ts` - Conference-related queries and mutations
- `games.ts` - Game-related queries and mutations
- `sync.ts` - Background functions for syncing with College Football Data API