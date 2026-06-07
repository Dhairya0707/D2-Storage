import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Project Queries & Mutations
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

export const getProject = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_projId", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const createProject = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    rootFolder: v.string(),
    createdAt: v.string(),
    corsAllowedOrigins: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("projects", args);
  },
});

export const updateProject = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    rootFolder: v.optional(v.string()),
    corsAllowedOrigins: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_projId", (q) => q.eq("id", args.id))
      .unique();
    if (!existing) return null;
    
    const { id, ...updates } = args;
    await ctx.db.patch(existing._id, updates);
    
    return { ...existing, ...updates };
  },
});

export const deleteProject = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_projId", (q) => q.eq("id", args.id))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    
    // Also delete any API keys for this project
    const keys = await ctx.db
      .query("api_keys")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.id))
      .collect();
    for (const key of keys) {
      await ctx.db.delete(key._id);
    }
  },
});

// API Key Queries & Mutations
export const getApiKeys = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("api_keys").collect();
  },
});

export const getApiKeysForProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("api_keys")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const createApiKey = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    keyHash: v.string(),
    projectId: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("api_keys", args);
  },
});

export const deleteApiKey = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("api_keys")
      .withIndex("by_keyId", (q) => q.eq("id", args.id))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const findProjectByApiKey = query({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const key = await ctx.db
      .query("api_keys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", args.keyHash))
      .unique();
    if (!key) return null;
    
    const project = await ctx.db
      .query("projects")
      .withIndex("by_projId", (q) => q.eq("id", key.projectId))
      .unique();
    if (!project) return null;
    
    return { project, key };
  },
});
