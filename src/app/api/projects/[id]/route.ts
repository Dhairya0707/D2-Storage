import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/db";
import { validateApiKey } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Check that the auth token matches this project, or is admin (master key)
  if (!auth.isAdmin && auth.projectId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, corsAllowedOrigins } = body;

  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (corsAllowedOrigins !== undefined) updates.corsAllowedOrigins = corsAllowedOrigins;

  const updated = await updateProject(id, updates);
  return NextResponse.json({ success: true, project: updated });
}
