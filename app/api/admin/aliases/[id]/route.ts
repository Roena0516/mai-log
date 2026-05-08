import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await params;
  await prisma.songAlias.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
