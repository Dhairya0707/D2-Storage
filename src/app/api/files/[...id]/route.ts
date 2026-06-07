import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "@/lib/cloudinary";
import { validateApiKey } from "@/lib/auth";
import { resolveProjectId, getCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  const projectId = await resolveProjectId(req);
  const headers = await getCorsHeaders(req, projectId);
  return new NextResponse(null, { status: 204, headers });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const projectId = await resolveProjectId(req);
  const headers = await getCorsHeaders(req, projectId);

  const auth = await validateApiKey(req.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = await params;
  const providerId = id.join("/");
  const resourceType = req.nextUrl.searchParams.get("type") || undefined;
  
  const destroyResult = await deleteFile(providerId, resourceType);
  
  if (destroyResult && destroyResult.result === "not_found") {
    return NextResponse.json({ success: false, error: "Asset not found on Cloudinary", details: destroyResult }, { status: 404, headers });
  }

  return NextResponse.json({ success: true, details: destroyResult }, { headers });
}
