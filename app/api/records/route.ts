import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const DIFF_MAP: Record<string, string> = {
  basic: "BASIC",
  advanced: "ADVANCED",
  expert: "EXPERT",
  master: "MASTER",
  remaster: "Re:MASTER",
};

const CLEAR_MAP: Record<string, string> = {
  app: "AP+",
  ap: "AP",
  fcp: "FC+",
  fc: "FC",
};

const SYNC_MAP: Record<string, string> = {
  fdxp: "FSD+", fsdp: "FSD+",
  fdx:  "FSD",  fsd:  "FSD",
  fsp:  "FS+",
  fs:   "FS",
  sync: "SYNC",
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const [records, recentLogsRaw] = await Promise.all([
      prisma.record.findMany({ where: { userId: session.user.id } }),
      prisma.recentLog.findMany({ where: { userId: session.user.id } }),
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
      include: { song: { select: { title: true, version: true } } },
    });

    const chartMap = new Map(
      charts.map((c) => [
        `${c.song.title}|${c.isDx}|${c.difficultyType}`,
        { lv: c.levelValue, version: c.song.version },
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
          name: r.title,
          ach: r.achievement / 10000,
          lv: chart.lv,
          diff: DIFF_MAP[r.difficultyType] ?? r.difficultyType,
          marks,
          isDx: r.isDx,
          version: chart.version,
        };
      })
      .filter((s) => s !== null);

    const recentLogs = recentLogsRaw
      .map((r) => {
        const chart = chartMap.get(`${r.title}|${r.isDx}|${r.difficultyType}`);
        if (!chart || !Number.isFinite(chart.lv)) return null;
        return {
          name: r.title,
          ach: r.achievement / 10000,
          lv: chart.lv,
          isDx: r.isDx,
          diff: DIFF_MAP[r.difficultyType] ?? r.difficultyType,
        };
      })
      .filter((s) => s !== null);

    return NextResponse.json({ ok: true, songs, recentLogs });
  } catch (err) {
    console.error("[GET /api/records]", err);
    return NextResponse.json({ ok: false, error: "internal server error" }, { status: 500 });
  }
}

interface UserProfile {
  nickname: string;
  title?: string;
  playCountTotal?: number;
  playCountVersion?: number;
}

interface RecordInput {
  title: string;
  achievement: number;
  difficulty_type: string;
  is_dx: boolean;
  sync: string | null;
  clear_mark: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userProfile, records, recentLogs } = body as {
      userProfile: UserProfile;
      records: RecordInput[];
      recentLogs: RecordInput[];
    };

    if (!userProfile?.nickname) {
      return NextResponse.json({ ok: false, error: "nickname required" }, { status: 400 });
    }

    // 세션의 userId로 업데이트 (다른 유저 데이터 덮어쓰기 방지)
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nickname: userProfile.nickname,
        title: userProfile.title,
        playCountTotal: userProfile.playCountTotal ?? 0,
        playCountVersion: userProfile.playCountVersion ?? 0,
      },
    });

    const [recordResult, logResult] = await prisma.$transaction([
      prisma.record.deleteMany({ where: { userId: user.id } }),
      prisma.recentLog.deleteMany({ where: { userId: user.id } }),
    ]);

    const [savedRecords, savedLogs] = await prisma.$transaction([
      prisma.record.createMany({
        data: (records ?? []).map((r) => ({
          userId: user.id,
          title: r.title,
          achievement: r.achievement,
          difficultyType: r.difficulty_type,
          isDx: r.is_dx,
          clearMark: r.clear_mark,
          sync: r.sync ?? null,
        })),
      }),
      prisma.recentLog.createMany({
        data: (recentLogs ?? []).map((r) => ({
          userId: user.id,
          title: r.title,
          achievement: r.achievement,
          difficultyType: r.difficulty_type,
          isDx: r.is_dx,
          clearMark: r.clear_mark,
          sync: r.sync ?? null,
        })),
      }),
    ]);

    return NextResponse.json({
      ok: true,
      saved: savedRecords.count,
      recentLogs: savedLogs.count,
    });
  } catch (err) {
    console.error("[POST /api/records]", err);
    return NextResponse.json({ ok: false, error: "internal server error" }, { status: 500 });
  }
}
