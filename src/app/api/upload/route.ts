import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/cloudinary";
import { validateApiKey } from "@/lib/auth";
import { getProject } from "@/lib/db";
import { resolveProjectId, getCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  const projectId = await resolveProjectId(req);
  const headers = await getCorsHeaders(req, projectId);
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const subfolder = (formData.get("folder") as string) || undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400, headers });
  }

  // Enforce a 10MB limit for direct server-side uploads to prevent Out-Of-Memory crashes
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({
      error: "Payload Too Large",
      message: "Direct server uploads are limited to 10MB. To upload larger assets (up to 1GB/2GB), implement direct client-to-Cloudinary signed uploads to bypass server memory and timeout restrictions."
    }, { status: 413, headers });
  }

  const result = await uploadFile(file, rootFolder, subfolder);

  return NextResponse.json({
    success: true,
    file: {
      id: result.id,
      name: result.name,
      url: result.url,
      size: result.size,
      type: result.type,
      resource_type: result.resource_type,
      provider_id: result.provider_id,
      created_at: result.created_at,
    }
  }, { headers });
}
