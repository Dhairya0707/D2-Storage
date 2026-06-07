import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

let client: ConvexHttpClient | null = null;

function getConvexClient(): ConvexHttpClient {
  if (client) return client;
  
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  
  client = new ConvexHttpClient(convexUrl);
  return client;
}

export interface Project {
  id: string;
  name: string;
  rootFolder: string;
  createdAt: string;
  corsAllowedOrigins?: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  projectId: string;
  createdAt: string;
}

export async function getProjects(): Promise<Project[]> {
  const convex = getConvexClient();
  const projects = await convex.query(api.db.getProjects);
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    rootFolder: p.rootFolder,
    createdAt: p.createdAt,
    corsAllowedOrigins: p.corsAllowedOrigins,
  }));
}

export async function getProject(id: string): Promise<Project | null> {
  const convex = getConvexClient();
  const p = await convex.query(api.db.getProject, { id });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    rootFolder: p.rootFolder,
    createdAt: p.createdAt,
    corsAllowedOrigins: p.corsAllowedOrigins,
  };
}

export async function createProject(project: Project): Promise<void> {
  const convex = getConvexClient();
  await convex.mutation(api.db.createProject, {
    id: project.id,
    name: project.name,
    rootFolder: project.rootFolder,
    createdAt: project.createdAt,
    corsAllowedOrigins: project.corsAllowedOrigins,
  });
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project | null> {
  const convex = getConvexClient();
  const p = await convex.mutation(api.db.updateProject, {
    id,
    name: updates.name,
    rootFolder: updates.rootFolder,
    corsAllowedOrigins: updates.corsAllowedOrigins,
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    rootFolder: p.rootFolder,
    createdAt: p.createdAt,
    corsAllowedOrigins: p.corsAllowedOrigins,
  };
}

export async function deleteProject(id: string): Promise<void> {
  const convex = getConvexClient();
  await convex.mutation(api.db.deleteProject, { id });
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const convex = getConvexClient();
  const keys = await convex.query(api.db.getApiKeys);
  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyHash: k.keyHash,
    projectId: k.projectId,
    createdAt: k.createdAt,
  }));
}

export async function getApiKeysForProject(
  projectId: string
): Promise<ApiKey[]> {
  const convex = getConvexClient();
  const keys = await convex.query(api.db.getApiKeysForProject, { projectId });
  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyHash: k.keyHash,
    projectId: k.projectId,
    createdAt: k.createdAt,
  }));
}

export async function createApiKey(key: ApiKey): Promise<void> {
  const convex = getConvexClient();
  await convex.mutation(api.db.createApiKey, {
    id: key.id,
    name: key.name,
    keyHash: key.keyHash,
    projectId: key.projectId,
    createdAt: key.createdAt,
  });
}

export async function deleteApiKey(id: string): Promise<void> {
  const convex = getConvexClient();
  await convex.mutation(api.db.deleteApiKey, { id });
}

export async function findProjectByApiKey(
  keyHash: string
): Promise<{ project: Project; key: ApiKey } | null> {
  const convex = getConvexClient();
  const result = await convex.query(api.db.findProjectByApiKey, { keyHash });
  if (!result) return null;
  return {
    project: {
      id: result.project.id,
      name: result.project.name,
      rootFolder: result.project.rootFolder,
      createdAt: result.project.createdAt,
      corsAllowedOrigins: result.project.corsAllowedOrigins,
    },
    key: {
      id: result.key.id,
      name: result.key.name,
      keyHash: result.key.keyHash,
      projectId: result.key.projectId,
      createdAt: result.key.createdAt,
    },
  };
}
