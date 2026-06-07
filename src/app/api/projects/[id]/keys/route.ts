import { NextRequest, NextResponse } from "next/server";
import {
  getApiKeysForProject,
  createApiKey,
  deleteApiKey,
  getProject,
} from "@/lib/db";
import { validateApiKey } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const keys = await getApiKeysForProject(id);
  return NextResponse.json({
    keys: keys.map((k) => ({ id: k.id, name: k.name, createdAt: k.createdAt })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const rawKey = `sk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

  const keyHash = await sha256(rawKey);

  await createApiKey({
    id: `key_${Date.now()}`,
    name,
    keyHash,
    projectId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, key: rawKey, name });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = req.nextUrl.searchParams.get("keyId");
  if (!keyId) {
    return NextResponse.json({ error: "Key ID required" }, { status: 400 });
  }

  await deleteApiKey(keyId);
  return NextResponse.json({ success: true });
}
