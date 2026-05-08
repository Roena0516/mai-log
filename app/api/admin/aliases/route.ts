import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.email && session.user.email === process.env.ADMIN_EMAIL;
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const aliases = await prisma.songAlias.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json({ ok: true, aliases });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const { title, alias } = await req.json();
  if (!title?.trim() || !alias?.trim())
    return NextResponse.json({ ok: false, error: "필드를 모두 입력하세요" }, { status: 400 });
  try {
    const created = await prisma.songAlias.create({
      data: { title: title.trim(), alias: alias.trim() },
    });
    return NextResponse.json({ ok: true, alias: created });
  } catch {
    return NextResponse.json({ ok: false, error: "이미 존재하는 별명입니다" }, { status: 409 });
  }
}
