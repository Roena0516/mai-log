import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const aliases = await prisma.songAlias.findMany({
      select: { id: true, title: true, alias: true },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ ok: true, aliases });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
