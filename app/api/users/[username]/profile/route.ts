import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        nickname: true,
        title: true,
        iconUrl: true,
        playCountTotal: true,
        playCountVersion: true,
      },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, profile: user });
  } catch (err) {
    console.error("[GET /api/users/[username]/profile]", err);
    return NextResponse.json({ ok: false, error: "internal server error" }, { status: 500 });
  }
}
