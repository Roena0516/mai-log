import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AliasManager from "./AliasManager";

interface OtogeSong {
  title?: string;
  version?: string;
  lev_bas?: string;
  dx_lev_bas?: string;
  lev_utage?: string;
}

const VERSION_MAP: Record<number, string> = {
  10000: "maimai",
  11000: "maimai PLUS",
  12000: "GreeN",
  13000: "GreeN PLUS",
  14000: "ORANGE",
  15000: "ORANGE PLUS",
  16000: "PiNK",
  17000: "PiNK PLUS",
  18000: "MURASAKi",
  18500: "MURASAKi PLUS",
  19000: "MiLK",
  19500: "MiLK PLUS",
  19900: "FiNALE",
  20000: "でらっくす",
  20500: "でらっくす PLUS",
  21000: "Splash",
  21500: "Splash PLUS",
  22000: "UNiVERSE",
  22500: "UNiVERSE PLUS",
  23000: "FESTiVAL",
  23500: "FESTiVAL PLUS",
  24000: "BUDDiES",
  24500: "BUDDiES PLUS",
  25000: "PRiSM",
  25500: "PRiSM PLUS",
  26000: "CiRCLE",
  26500: "CiRCLE PLUS",
};

function getVersionName(version: number): string {
  const keys = Object.keys(VERSION_MAP)
    .map(Number)
    .sort((a, b) => a - b);
  let result = VERSION_MAP[keys[0]];
  for (const key of keys) {
    if (version >= key) result = VERSION_MAP[key];
  }
  return result;
}

// 내수판(일본판) 곡 데이터 — 국제판에 아직 없는 신곡까지 별명을 작성할 수 있도록 함께 불러온다.
async function fetchDomesticSongs(): Promise<{ title: string; version: number }[]> {
  try {
    const res = await fetch("https://otoge-db.net/maimai/data/music-ex.json", {
      // 하루 단위로 캐시 (2MB 남짓 JSON을 매 요청마다 받지 않도록)
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const songs: OtogeSong[] = await res.json();
    return songs
      // UTAGE 채보(보면) 제외 — seed.ts와 동일한 기준
      .filter((s) => !(s.lev_utage && !s.lev_bas && !s.dx_lev_bas))
      .filter((s): s is OtogeSong & { title: string } => !!s.title)
      .map((s) => ({ title: s.title, version: parseInt(s.version ?? "0") || 0 }));
  } catch {
    return [];
  }
}

export default async function AdminAliasesPage() {
  const session = await auth();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) notFound();

  const [aliases, dbSongs, domesticSongs] = await Promise.all([
    prisma.songAlias.findMany({ orderBy: { title: "asc" } }),
    prisma.song.findMany({ select: { title: true, version: true } }),
    fetchDomesticSongs(),
  ]);

  const dbTitles = new Set(dbSongs.map((s) => s.title));

  // title -> version 맵 (DB 기준, 없으면 내수판 데이터로 보강)
  const versionMap = new Map<string, number>();
  for (const s of dbSongs) versionMap.set(s.title, s.version);
  for (const s of domesticSongs)
    if (!versionMap.has(s.title)) versionMap.set(s.title, s.version);

  // 곡 목록: DB 곡 + 내수판 신곡 (title 기준 중복 제거)
  const titles = [...new Set([...dbTitles, ...domesticSongs.map((s) => s.title)])];

  const songs = titles
    .map((title) => {
      const version = versionMap.get(title) ?? 0;
      return {
        title,
        version,
        versionName: getVersionName(version),
        isNew: !dbTitles.has(title),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return <AliasManager initialAliases={aliases} songs={songs} />;
}
