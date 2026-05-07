import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url");
  if (!imageUrl) {
    return new NextResponse("missing url", { status: 400 });
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return new NextResponse("upstream error", { status: res.status });
    }
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("failed to fetch image", { status: 500 });
  }
}
