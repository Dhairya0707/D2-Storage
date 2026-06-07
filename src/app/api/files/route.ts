import { NextRequest, NextResponse } from "next/server";
import { listFiles } from "@/lib/cloudinary";
import { validateApiKey } from "@/lib/auth";
import { getProject } from "@/lib/db";
import { resolveProjectId, getCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  const projectId = await resolveProjectId(req);
  const headers = await getCorsHeaders(req, projectId);
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(req: NextRequest) {
  const projectId = await resolveProjectId(req);
  const headers = await getCorsHeaders(req, projectId);

  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  let rootFolder = auth.rootFolder;

  if (!rootFolder && auth.isAdmin) {
    if (projectId) {
      const project = await getProject(projectId);
      if (project) rootFolder = project.rootFolder;
    }
  }

  if (!rootFolder) {
    return NextResponse.json({ error: "Project-scoped API key or projectId param required" }, { status: 403, headers });
  }

  const subfolder = req.nextUrl.searchParams.get("folder") || undefined;
  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") || "20"),
    100
  );

  const result = await listFiles(rootFolder, subfolder, cursor, limit);

  return NextResponse.json({
    files: result.files,
    nextCursor: result.nextCursor,
  }, { headers });
}
