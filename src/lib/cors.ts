import { NextRequest } from "next/server";
import { getProject, findProjectByApiKey } from "./db";
import { sha256 } from "./crypto";

export async function resolveProjectId(request: NextRequest): Promise<string | null> {
  // 1. Try from query parameter
  const queryId = request.nextUrl.searchParams.get("projectId");
  if (queryId) return queryId;

  // 2. Try from Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const key = authHeader.slice(7);
    const MASTER_KEYS = (process.env.API_KEYS || "").split(",").filter(Boolean);
    if (!MASTER_KEYS.includes(key)) {
      try {
        const keyHash = await sha256(key);
        const result = await findProjectByApiKey(keyHash);
        if (result) return result.project.id;
      } catch {
        // ignore
      }
    }
  }

  // 3. Try from path segment (e.g. for DELETE requests)
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/files/")) {
    const parts = pathname.replace("/api/files/", "").split("/");
    if (parts[0] === "dreambit" && parts[1]) {
      return parts[1];
    }
  }

  return null;
}

export async function getCorsHeaders(request: NextRequest, projectId: string | null): Promise<Headers> {
  const origin = request.headers.get("origin");
  const headers = new Headers();

  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");

  if (!origin) {
    headers.set("Access-Control-Allow-Origin", "*");
    return headers;
  }

  if (!projectId) {
    headers.set("Access-Control-Allow-Origin", "*");
    return headers;
  }

  const project = await getProject(projectId);
  if (!project) {
    headers.set("Access-Control-Allow-Origin", "*");
    return headers;
  }

  const allowed = project.corsAllowedOrigins || ["*"];

  if (allowed.includes("*") || allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    // Specifically block unauthorized origin
    headers.set("Access-Control-Allow-Origin", "null");
  }

  return headers;
}
