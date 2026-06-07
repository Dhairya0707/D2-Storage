import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") || "download";

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch file");

    const buffer = await res.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${name}"`);
    headers.set("Content-Type", res.headers.get("Content-Type") || "application/octet-stream");

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to download asset" }, { status: 500 });
  }
}
