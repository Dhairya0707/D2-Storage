import { findProjectByApiKey } from "./db";
import { sha256 } from "./crypto";

const MASTER_KEYS = (process.env.API_KEYS || "").split(",").filter(Boolean);

export interface AuthContext {
  projectId?: string;
  rootFolder?: string;
  isAdmin: boolean;
}

export async function validateApiKey(
  authHeader: string | null
): Promise<AuthContext | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7);

  if (MASTER_KEYS.includes(key)) {
    return { isAdmin: true };
  }

  const keyHash = await sha256(key);
  const result = await findProjectByApiKey(keyHash);
  if (result) {
    return {
      projectId: result.project.id,
      rootFolder: result.project.rootFolder,
      isAdmin: false,
    };
  }

  return null;
}
