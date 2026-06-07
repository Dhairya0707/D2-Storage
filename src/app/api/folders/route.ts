import { NextRequest, NextResponse } from "next/server";
import { listFolders, createFolder, deleteSubfolder } from "@/lib/cloudinary";
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

  const folders = await listFolders(rootFolder);
  return NextResponse.json({ folders }, { headers });
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

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Folder name required" }, { status: 400, headers });
  }

  const cleanName = name.replace(/[^a-zA-Z0-9_\-\/]/g, "");
  try {
    await createFolder(rootFolder, cleanName);
    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create folder" }, { status: 500, headers });
  }
}

export async function DELETE(req: NextRequest) {
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

  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Folder name required" }, { status: 400, headers });
  }

  try {
    await deleteSubfolder(rootFolder, name);
    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete folder" }, { status: 500, headers });
  }
}
