import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject, getProject, deleteProject, createApiKey } from "@/lib/db";
import { validateApiKey } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import { deleteProjectFolder } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, rootFolder: customRootFolder } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  // Accept custom folder if provided, otherwise slugify project name or fallback to auto-generated ID
  let folderName = customRootFolder?.trim();
  if (!folderName) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    folderName = `dreambit/${slug || id}`;
  } else {
    // Ensure it starts with dreambit/ or similar if required, or keep custom
    if (!folderName.startsWith("dreambit/")) {
      folderName = `dreambit/${folderName}`;
    }
  }

  await createProject({
    id,
    name,
    rootFolder: folderName,
    createdAt: new Date().toISOString(),
    corsAllowedOrigins: ["*"],
  });

  // Automatically generate default API key
  const rawKey = `sk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

  const keyHash = await sha256(rawKey);

  await createApiKey({
    id: `key_${Date.now()}`,
    name: "Default Key",
    keyHash,
    projectId: id,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, id, rootFolder: folderName, apiKey: rawKey });
}

export async function DELETE(req: NextRequest) {
  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  const project = await getProject(id);
  if (project) {
    await deleteProjectFolder(project.rootFolder);
  }

  await deleteProject(id);
  return NextResponse.json({ success: true });
}
