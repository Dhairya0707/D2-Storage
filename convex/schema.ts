import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    id: v.string(),
    name: v.string(),
    rootFolder: v.string(),
    createdAt: v.string(),
    corsAllowedOrigins: v.optional(v.array(v.string())),
  }).index("by_projId", ["id"]),
  
  api_keys: defineTable({
    id: v.string(),
    name: v.string(),
    keyHash: v.string(),
    projectId: v.string(),
    createdAt: v.string(),
  })
    .index("by_keyId", ["id"])
    .index("by_keyHash", ["keyHash"])
    .index("by_projectId", ["projectId"]),
});
