import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJSON<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeJSON<T>(file: string, data: T[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
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
  return readJSON<Project>("projects.json");
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function createProject(project: Project): Promise<void> {
  const projects = await getProjects();
  projects.push(project);
  await writeJSON("projects.json", projects);
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;
  projects[index] = { ...projects[index], ...updates };
  await writeJSON("projects.json", projects);
  return projects[index];
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await getProjects();
  await writeJSON(
    "projects.json",
    projects.filter((p) => p.id !== id)
  );
  const keys = await getApiKeys();
  await writeJSON(
    "api_keys.json",
    keys.filter((k) => k.projectId !== id)
  );
}

export async function getApiKeys(): Promise<ApiKey[]> {
  return readJSON<ApiKey>("api_keys.json");
}

export async function getApiKeysForProject(
  projectId: string
): Promise<ApiKey[]> {
  const keys = await getApiKeys();
  return keys.filter((k) => k.projectId === projectId);
}

export async function createApiKey(key: ApiKey): Promise<void> {
  const keys = await getApiKeys();
  keys.push(key);
  await writeJSON("api_keys.json", keys);
}

export async function deleteApiKey(id: string): Promise<void> {
  const keys = await getApiKeys();
  await writeJSON(
    "api_keys.json",
    keys.filter((k) => k.id !== id)
  );
}

export async function findProjectByApiKey(
  keyHash: string
): Promise<{ project: Project; key: ApiKey } | null> {
  const keys = await getApiKeys();
  const match = keys.find((k) => k.keyHash === keyHash);
  if (!match) return null;
  const project = await getProject(match.projectId);
  if (!project) return null;
  return { project, key: match };
}
