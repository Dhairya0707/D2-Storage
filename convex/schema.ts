/**
 * Convex Schema — Reserved for future multi-tenant hosted version of D2 Storage.
 *
 * This schema is NOT active in the current self-hosted open-source version.
 * The live app uses a local JSON flat-file database (src/lib/db.ts) instead.
 *
 * The Convex backend is planned for a future "D2 Storage Cloud" edition that
 * will support user accounts, multi-tenant workspaces, and a hosted gateway.
 * If you are self-hosting, you can safely ignore this directory.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    rootFolder: v.string(),
  }),
  api_keys: defineTable({
    name: v.string(),
    keyHash: v.string(),
    projectId: v.string(),
  }),
});
