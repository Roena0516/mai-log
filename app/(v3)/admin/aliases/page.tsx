import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AliasManager from "./AliasManager";

export default async function AdminAliasesPage() {
  const session = await auth();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) notFound();

  const [aliases, songs] = await Promise.all([
    prisma.songAlias.findMany({ orderBy: { title: "asc" } }),
    prisma.song.findMany({ select: { title: true }, orderBy: { title: "asc" } }),
  ]);

  const songTitles = [...new Set(songs.map((s) => s.title))];

  return <AliasManager initialAliases={aliases} songTitles={songTitles} />;
}
