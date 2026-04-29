import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
