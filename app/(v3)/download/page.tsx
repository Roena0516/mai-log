"use client";

import { useRef, useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { toPng } from "html-to-image";
import GameTabs from "../components/GameTabs";
import { GAMES } from "../lib/games";
import { T } from "../lib/tokens";
import {
  convertScore,
  buildDisplayMarks,
  convertDiff,
  MAI_DIFF_COLOR,
  GAME_DIFF_COLOR,
} from "../lib/scoreConvert";
import type { GameId, Song, RecentLogEntry, DiffType } from "../lib/types";

type SongWithRS = Song & { _rs: number };

interface CardSong {
  name: string;
  ach: number;
  lv: number;
  isDx?: boolean;
  diff: string;
  marks: string[];
  _rs: number;
  version?: number;
  imageUrl?: string;
}

interface UserProfile {
  nickname: string | null;
  title: string | null;
  iconUrl: string | null;
  playCountTotal: number;
  playCountVersion: number;
}

const CARD_W = 110;
const CARD_H = 115;

function getDiffColor(
  diff: string,
  lv: number,
  game: GameId,
  version?: number,
): string {
  const convertedDiff = convertDiff(lv, game, diff as DiffType, version);
  const diffName = convertedDiff || diff;
  return game !== "maimai"
    ? (GAME_DIFF_COLOR[game]?.[diffName] ?? "#888")
    : (MAI_DIFF_COLOR[diff] ?? "#888");
}

function getDisplayLv(lv: number, game: GameId): string {
  if (game === "chunithm") return (Math.round((lv + 0.7) * 10) / 10).toFixed(1);
  if (game === "sdvx")
    return (Math.round((lv / 15.0) * 20.9 * 10) / 10).toFixed(1);
  if (game === "arcaea")
    return (Math.round((lv / 15.0) * 12.0 * 10) / 10).toFixed(1);
  return lv.toFixed(1);
}

function JacketCard({
  song,
  game,
  rank,
  dataUrl,
}: {
  song: CardSong;
  game: GameId;
  rank: number;
  dataUrl?: string;
}) {
  const g = GAMES[game];
  const displayLv = getDisplayLv(song.lv, game);
  const scoreStr = convertScore(song.ach, game);
  const allMarks = buildDisplayMarks(song.ach, song.marks, game);
  const mark = allMarks[0] ?? "";
  const diffColor = getDiffColor(song.diff, song.lv, game, song.version);
  const diffLabel =
    game === "maimai"
      ? song.diff
      : convertDiff(song.lv, game, song.diff as DiffType, song.version) ||
        song.diff;
  const rs = g.formatRS(song._rs);

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
        border: "1px solid #252525",
        borderTopWidth: 3,
        borderTopColor: diffColor,
        boxSizing: "border-box",
      }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{ position: "absolute", inset: 0, background: "#1c1c1c" }}
        />
      )}

      {/* gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 28%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.93) 100%)",
        }}
      />

      {/* rank + DX/ST badge */}
      <div
        style={{
          position: "absolute",
          top: 5,
          left: 6,
          right: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.06em",
            fontWeight: 600,
          }}
        >
          #{rank}
        </span>
        {game === "maimai" && (
          <span
            style={{
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: song.isDx ? "#f97316" : "rgba(255,255,255,0.5)",
            }}
          >
            {song.isDx ? "DX" : "ST"}
          </span>
        )}
      </div>

      {/* bottom info */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "5px 6px 6px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {rs}
        </div>

        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "#ddd",
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.name}
        </div>

        <div
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: "-0.01em",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {displayLv} · {scoreStr}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 7,
              fontWeight: 700,
              color: diffColor,
              letterSpacing: "0.05em",
            }}
          >
            {diffLabel}
          </span>
          {mark && (
            <span
              style={{
                fontSize: 7,
                fontWeight: 700,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.03em",
              }}
            >
              {mark}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  label,
  top,
  avgRs,
  game,
}: {
  label: string;
  top: number;
  avgRs?: number;
  game: GameId;
}) {
  const g = GAMES[game];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: "8px 0 4px",
        borderBottom: "1px solid #202020",
        marginTop: 8,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#aaa",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 9, color: "#666" }}>TOP {top}</span>
      {avgRs !== undefined && (
        <span style={{ fontSize: 9, color: "#777", marginLeft: "auto" }}>
          avg {g.formatRS(avgRs)}
        </span>
      )}
    </div>
  );
}

function CardGrid({
  songs,
  game,
  cols = 5,
  startRank = 1,
  dataUrls = new Map(),
}: {
  songs: CardSong[];
  game: GameId;
  cols?: number;
  startRank?: number;
  dataUrls?: Map<string, string>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${CARD_W}px)`,
        gap: 4,
        marginTop: 5,
      }}
    >
      {songs.map((s, i) => (
        <JacketCard
          key={`${i}-${s.name}-${s.diff}-${s.isDx}`}
          song={s}
          game={game}
          rank={startRank + i}
          dataUrl={s.imageUrl ? dataUrls.get(s.imageUrl) : undefined}
        />
      ))}
    </div>
  );
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function DownloadPage() {
  const [activeGame, setActiveGame] = useState<GameId>("maimai");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewGenerating, setPreviewGenerating] = useState(false);
  const [jacketDataUrls, setJacketDataUrls] = useState<Map<string, string>>(
    new Map(),
  );
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null);
  const [imagesReady, setImagesReady] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const { songs, recentLogs, recordsLoading: loading } = useGame();

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setProfile(data.profile);
      });
  }, []);

  // Pre-fetch all jacket images as data URLs to avoid html-to-image caching bugs
  useEffect(() => {
    if (!songs.length) return;
    const imageUrls = [
      ...new Set([
        ...songs.flatMap((s) => (s.imageUrl ? [s.imageUrl] : [])),
        ...recentLogs.flatMap((r) => (r.imageUrl ? [r.imageUrl] : [])),
      ]),
    ];
    setImagesReady(false);
    Promise.allSettled(
      imageUrls.map(async (imageUrl) => {
        const dataUrl = await fetchAsDataUrl(
          `/api/jacket?url=${encodeURIComponent(`https://otoge-db.net/maimai/jacket/${imageUrl}`)}`,
        );
        return [imageUrl, dataUrl] as const;
      }),
    ).then((results) => {
      const map = new Map<string, string>();
      for (const r of results) {
        if (r.status === "fulfilled") map.set(r.value[0], r.value[1]);
      }
      setJacketDataUrls(map);
      setImagesReady(true);
    });
  }, [songs]);

  // Pre-fetch profile icon as data URL
  useEffect(() => {
    if (!profile?.iconUrl) return;
    fetchAsDataUrl(`/api/jacket?url=${encodeURIComponent(profile.iconUrl)}`)
      .then(setIconDataUrl)
      .catch(console.error);
  }, [profile?.iconUrl]);

  // Auto-generate PNG preview whenever data changes
  useEffect(() => {
    if (loading || !imagesReady || !captureRef.current) return;
    let cancelled = false;
    setPreviewGenerating(true);
    const timer = setTimeout(() => {
      if (!captureRef.current || cancelled) return;
      toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0d0d0d",
        skipFonts: true,
      })
        .then((url) => {
          if (!cancelled) setPreviewUrl(url);
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setPreviewGenerating(false);
        });
    }, 80);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    activeGame,
    songs,
    recentLogs,
    loading,
    profile,
    imagesReady,
    jacketDataUrls,
    iconDataUrl,
  ]);

  const handleSave = () => {
    if (!previewUrl || saving) return;
    setSaving(true);
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `mai-log-${activeGame}.png`;
    a.click();
    setSaving(false);
  };

  const g = GAMES[activeGame];
  const withRS: SongWithRS[] = songs.map((s) => ({
    ...s,
    _rs: g.calcRS(s.ach, s.lv, s.marks),
  }));

  type Section = { label: string; songs: CardSong[] };
  let sections: Section[] = [];

  if (activeGame === "maimai" || activeGame === "chunithm") {
    const [newTop, oldTop] = activeGame === "maimai" ? [15, 35] : [20, 30];
    const threshold = g.newVersionThreshold ?? 0;
    const isNew = (s: SongWithRS) => (s.version ?? 0) >= threshold;
    sections = [
      {
        label: activeGame === "maimai" ? "NEW" : "NEW",
        songs: withRS
          .filter(isNew)
          .sort((a, b) => b._rs - a._rs)
          .slice(0, newTop),
      },
      {
        label: "OTHERS",
        songs: withRS
          .filter((s) => !isNew(s))
          .sort((a, b) => b._rs - a._rs)
          .slice(0, oldTop),
      },
    ];
  } else if (activeGame === "sdvx") {
    sections = [
      {
        label: "VOLFORCE",
        songs: [...withRS].sort((a, b) => b._rs - a._rs).slice(0, 50),
      },
    ];
  } else {
    const recentMap = new Map<string, RecentLogEntry>();
    for (const log of recentLogs.slice(0, 30)) {
      const key = `${log.name}|${log.isDx}|${log.diff}`;
      const existing = recentMap.get(key);
      if (!existing || log.ach > existing.ach) recentMap.set(key, log);
    }
    const recentTop10: CardSong[] = [...recentMap.values()]
      .map((log) => ({ ...log, marks: [], _rs: g.calcRS(log.ach, log.lv, []) }))
      .sort((a, b) => b._rs - a._rs)
      .slice(0, 10);
    const recentKeys = new Set(
      recentTop10.map((r) => `${r.name}|${r.isDx}|${r.diff}`),
    );
    const best30 = withRS
      .filter((s) => !recentKeys.has(`${s.name}|${s.isDx}|${s.diff}`))
      .sort((a, b) => b._rs - a._rs)
      .slice(0, 30);
    sections = [
      { label: "RECENT", songs: recentTop10 },
      { label: "BEST", songs: best30 },
    ];
  }

  const totalRs = g.formatTotal(g.calcTotal(withRS, recentLogs));
  const isTwoCol = activeGame !== "sdvx";

  const getAvgRs = (list: CardSong[]) =>
    list.length > 0
      ? Math.round(
          (list.reduce((acc, r) => acc + r._rs, 0) / list.length) * 100,
        ) / 100
      : 0;

  const leftCols =
    activeGame === "chunithm" ? 4 : activeGame === "arcaea" ? 2 : 3;
  const rightCols =
    activeGame === "maimai" ? 7 :
    activeGame === "chunithm" ? 6 :
    activeGame === "sdvx" ? 10 : 6;
  const leftWidth = CARD_W * leftCols + 4 * (leftCols - 1);
  const rightWidth = CARD_W * rightCols + 4 * (rightCols - 1);
  const singleWidth = CARD_W * rightCols + 4 * (rightCols - 1);
  const minWidth = isTwoCol ? leftWidth + 12 + rightWidth : singleWidth;

  return (
    <div style={{ position: "relative" }}>
      <GameTabs active={activeGame} onChange={setActiveGame} />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "12px 0 0",
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            padding: "8px 20px",
            background: T.text,
            color: "#fff",
            border: "none",
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.06em",
            cursor: saving || loading ? "not-allowed" : "pointer",
            opacity: saving || loading ? 0.4 : 1,
          }}
        >
          {saving ? "SAVING…" : "PNG 저장"}
        </button>
      </div>

      {/* off-screen capture target */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          pointerEvents: "none",
        }}
      >
        <div
          ref={captureRef}
          style={{
            background: "#0d0d0d",
            padding: "16px 16px 20px",
            display: "inline-block",
          }}
        >
          {/* header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 10,
              borderBottom: "1px solid #1e1e1e",
              minWidth: minWidth,
              gap: 16,
            }}
          >
            {/* profile */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  background: "#242424",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {iconDataUrl ? (
                  <img
                    src={iconDataUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#444" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#444" />
                  </svg>
                )}
              </div>
              <div>
                {profile?.title && (
                  <div
                    style={{
                      fontSize: 8,
                      color: "#888",
                      letterSpacing: "0.06em",
                      marginBottom: 1,
                    }}
                  >
                    {profile.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {profile?.nickname ?? "—"}
                </div>
              </div>
            </div>

            {/* wordmark */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.04em",
              }}
            >
              mai<span style={{ color: g.accent }}>·</span>log
              <span
                style={{
                  fontSize: 10,
                  color: "#6a6a6a",
                  fontWeight: 400,
                  marginLeft: 10,
                  letterSpacing: "0.04em",
                }}
              >
                {g.label}
              </span>
            </span>

            {/* rating */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{ fontSize: 8, color: "#777", letterSpacing: "0.1em" }}
              >
                {g.ratingLabel}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: g.accent,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {totalRs}
              </div>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "40px 0",
                color: "#444",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              불러오는 중...
            </div>
          ) : isTwoCol ? (
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 10,
                alignItems: "flex-start",
              }}
            >
              {/* Left: NEW/현행 */}
              <div style={{ flexShrink: 0, width: leftWidth }}>
                <SectionLabel
                  label={sections[0].label}
                  top={sections[0].songs.length}
                  avgRs={getAvgRs(sections[0].songs)}
                  game={activeGame}
                />
                <CardGrid
                  songs={sections[0].songs}
                  game={activeGame}
                  cols={leftCols}
                  dataUrls={jacketDataUrls}
                />
              </div>
              {/* Right: OTHERS */}
              <div style={{ flexShrink: 0, width: rightWidth }}>
                <SectionLabel
                  label={sections[1].label}
                  top={sections[1].songs.length}
                  avgRs={getAvgRs(sections[1].songs)}
                  game={activeGame}
                />
                <CardGrid
                  songs={sections[1].songs}
                  game={activeGame}
                  cols={rightCols}
                  dataUrls={jacketDataUrls}
                />
              </div>
            </div>
          ) : (
            sections.map((sec) => (
              <div key={sec.label}>
                <SectionLabel
                  label={sec.label}
                  top={sec.songs.length}
                  avgRs={getAvgRs(sec.songs)}
                  game={activeGame}
                />
                <CardGrid
                  songs={sec.songs}
                  game={activeGame}
                  cols={rightCols}
                  dataUrls={jacketDataUrls}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* PNG preview */}
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        {previewGenerating && (
          <div style={{ padding: "40px 0", color: T.sub, fontSize: 12 }}>
            미리보기 생성 중...
          </div>
        )}
        {previewUrl && !previewGenerating && (
          <img
            src={previewUrl}
            alt="rating card"
            style={{
              display: "block",
              maxWidth: "100%",
              imageRendering: "auto",
            }}
          />
        )}
      </div>
    </div>
  );
}
