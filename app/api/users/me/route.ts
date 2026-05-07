import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      return NextResponse.json(
        { ok: false, error: "user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, profile: user });
  } catch (err) {
    console.error("[GET /api/users/me]", err);
    return NextResponse.json(
      { ok: false, error: "internal server error" },
      { status: 500 },
    );
  }
}
