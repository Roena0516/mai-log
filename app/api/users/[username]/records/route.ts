import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DIFF_MAP: Record<string, string> = {
  basic: "BASIC", advanced: "ADVANCED", expert: "EXPERT",
  master: "MASTER", remaster: "Re:MASTER",
};
const CLEAR_MAP: Record<string, string> = {
  app: "AP+", ap: "AP", fcp: "FC+", fc: "FC",
};
const SYNC_MAP: Record<string, string> = {
  fdxp: "FSD+", fsdp: "FSD+", fdx: "FSD", fsd: "FSD",
  fsp: "FS+", fs: "FS", sync: "SYNC",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }

    const [records, recentLogsRaw] = await Promise.all([
      prisma.record.findMany({ where: { userId: user.id } }),
      prisma.recentLog.findMany({ where: { userId: user.id } }),
    ]);

    if (records.length === 0) {
      return NextResponse.json({ ok: true, songs: [], recentLogs: [] });
    }

    const allTitles = [...new Set([
      ...records.map((r) => r.title),
      ...recentLogsRaw.map((r) => r.title),
    ])];

    const charts = await prisma.chart.findMany({
      where: { song: { title: { in: allTitles } } },
      include: { song: { select: { title: true, version: true, imageUrl: true } } },
    });

    const chartMap = new Map(
      charts.map((c) => [
        `${c.song.title}|${c.isDx}|${c.difficultyType}`,
        { lv: c.levelValue, version: c.song.version, imageUrl: c.song.imageUrl },
      ]),
    );

    const songs = records
      .map((r) => {
        const chart = chartMap.get(`${r.title}|${r.isDx}|${r.difficultyType}`);
        if (!chart || !Number.isFinite(chart.lv)) return null;
        const marks: string[] = [];
        if (r.clearMark && CLEAR_MAP[r.clearMark]) marks.push(CLEAR_MAP[r.clearMark]);
        if (r.sync && SYNC_MAP[r.sync]) marks.push(SYNC_MAP[r.sync]);
        return {
          name: r.title, ach: r.achievement / 10000, lv: chart.lv,
          diff: DIFF_MAP[r.difficultyType] ?? r.difficultyType,
          marks, isDx: r.isDx, version: chart.version, imageUrl: chart.imageUrl,
        };
      })
      .filter((s) => s !== null);

    const recentLogs = recentLogsRaw
      .map((r) => {
        const chart = chartMap.get(`${r.title}|${r.isDx}|${r.difficultyType}`);
        if (!chart || !Number.isFinite(chart.lv)) return null;
        return {
          name: r.title, ach: r.achievement / 10000, lv: chart.lv,
          isDx: r.isDx, diff: DIFF_MAP[r.difficultyType] ?? r.difficultyType,
          imageUrl: chart.imageUrl,
        };
      })
      .filter((s) => s !== null);

    return NextResponse.json({ ok: true, songs, recentLogs });
  } catch (err) {
    console.error("[GET /api/users/[username]/records]", err);
    return NextResponse.json({ ok: false, error: "internal server error" }, { status: 500 });
  }
}
