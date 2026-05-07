import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const RESERVED = new Set([
  "rating", "log", "list", "download", "sync", "setup", "api", "auth",
  "admin", "settings", "profile", "me", "user", "users",
]);

function isValidUsername(username: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username) &&
    !username.includes("--");
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const { username } = await req.json() as { username: string };

    if (!username || !isValidUsername(username)) {
      return NextResponse.json(
        { ok: false, error: "영소문자·숫자·하이픈 3~30자, 시작/끝은 영소문자·숫자" },
        { status: 400 },
      );
    }

    if (RESERVED.has(username)) {
      return NextResponse.json({ ok: false, error: "사용할 수 없는 username입니다" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ ok: false, error: "이미 사용중인 username입니다" }, { status: 409 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
    });

    return NextResponse.json({ ok: true, username });
  } catch (err) {
    console.error("[PUT /api/users/me/username]", err);
    return NextResponse.json({ ok: false, error: "internal server error" }, { status: 500 });
  }
}
