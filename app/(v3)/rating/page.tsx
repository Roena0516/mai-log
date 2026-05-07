"use client";

import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import GameTabs from "../components/GameTabs";
import SongRow from "../components/SongRow";
import { GAMES } from "../lib/games";
import { T } from "../lib/tokens";
import type {
  GameId,
  Song,
  RecentLogEntry,
  DiffType,
  MarkType,
} from "../lib/types";

type SongWithRS = Song & { _rs: number };

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: "14px 0 6px",
        borderBottom: `1px solid ${T.line}`,
        marginTop: 8,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.sub,
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 11, color: T.line }}>TOP {count}</span>
    </div>
  );
}

export default function RatingPage() {
  const [activeGame, setActiveGame] = useState<GameId>("maimai");
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveGame: setCtxGame, setConvertedTotal } = useGame();

  useEffect(() => {
    fetch("/api/records")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setSongs(data.songs);
          setRecentLogs(data.recentLogs ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateGame = (game: GameId) => {
    setActiveGame(game);
    setCtxGame(game);
    const g = GAMES[game];
    const withRS = songs.map((s) => ({
      ...s,
      _rs: g.calcRS(s.ach, s.lv, s.marks),
    }));
    setConvertedTotal(g.formatTotal(g.calcTotal(withRS, recentLogs)));
  };

  useEffect(() => {
    if (!loading) updateGame("maimai");
  }, [loading]);

  const g = GAMES[activeGame];

  if (loading) {
    return (
      <div
        style={{
          padding: "40px 0",
          textAlign: "center",
          color: T.sub,
          fontSize: 13,
        }}
      >
        불러오는 중...
      </div>
    );
  }
  if (songs.length === 0) {
    return (
      <div
        style={{
          padding: "40px 0",
          textAlign: "center",
          color: T.sub,
          fontSize: 13,
        }}
      >
        북마클릿으로 기록을 수집하면 여기에 표시됩니다.
      </div>
    );
  }

  const withRS = songs.map((s) => ({
    ...s,
    _rs: g.calcRS(s.ach, s.lv, s.marks),
  }));

  // maimai / CHUNITHM: 신곡 + 구곡 섹션
  if (activeGame === "maimai" || activeGame === "chunithm") {
    const threshold = g.newVersionThreshold ?? 0;
    const isNew = (s: SongWithRS) => (s.version ?? 0) >= threshold;
    const newSongs = withRS.filter(isNew).sort((a, b) => b._rs - a._rs);
    const oldSongs = withRS.filter((s) => !isNew(s)).sort((a, b) => b._rs - a._rs);
    const [newTop, oldTop] = activeGame === "maimai" ? [15, 35] : [20, 30];

    const renderSection = (list: SongWithRS[], top: number) =>
      list
        .slice(0, top)
        .map((s, i) => (
          <SongRow
            key={`${s.name}-${s.diff}-${s.isDx}`}
            song={s}
            game={activeGame}
            rank={`#${i + 1}`}
          />
        ));

    return (
      <div>
        <GameTabs active={activeGame} onChange={updateGame} />
        <SectionHeader label="신곡" count={newTop} />
        {renderSection(newSongs, newTop)}
        <SectionHeader label="구곡" count={oldTop} />
        {renderSection(oldSongs, oldTop)}
      </div>
    );
  }

  // SDVX: 상위 50곡
  if (activeGame === "sdvx") {
    const top50 = [...withRS].sort((a, b) => b._rs - a._rs).slice(0, 50);
    return (
      <div>
        <GameTabs active={activeGame} onChange={updateGame} />
        {top50.map((s, i) => (
          <SongRow
            key={`${s.name}-${s.diff}-${s.isDx}`}
            song={s}
            game={activeGame}
            rank={`#${i + 1}`}
          />
        ))}
      </div>
    );
  }

  // Arcaea: Recent 10 + Best 30
  const recentMap = new Map<string, RecentLogEntry>();
  for (const log of recentLogs.slice(0, 30)) {
    const key = `${log.name}|${log.isDx}|${log.diff}`;
    const existing = recentMap.get(key);
    if (!existing || log.ach > existing.ach) recentMap.set(key, log);
  }

  const recentTop10 = [...recentMap.values()]
    .map((log) => ({
      name: log.name,
      ach: log.ach,
      lv: log.lv,
      isDx: log.isDx,
      diff: log.diff as DiffType,
      marks: [] as MarkType[],
      _rs: g.calcRS(log.ach, log.lv, []),
    }))
    .sort((a, b) => b._rs - a._rs)
    .slice(0, 10);

  const recentKeys = new Set(
    recentTop10.map((r) => `${r.name}|${r.isDx}|${r.diff}`),
  );

  const best30 = withRS
    .filter((s) => !recentKeys.has(`${s.name}|${s.isDx}|${s.diff}`))
    .sort((a, b) => b._rs - a._rs)
    .slice(0, 30);

  return (
    <div>
      <GameTabs active={activeGame} onChange={updateGame} />
      <SectionHeader label="RECENT" count={10} />
      {recentTop10.map((s, i) => (
        <SongRow
          key={`recent-${s.name}-${s.diff}-${s.isDx}`}
          song={s}
          game={activeGame}
          rank={`#${i + 1}`}
        />
      ))}
      <SectionHeader label="BEST" count={30} />
      {best30.map((s, i) => (
        <SongRow
          key={`best-${s.name}-${s.diff}-${s.isDx}`}
          song={s}
          game={activeGame}
          rank={`#${i + 1}`}
        />
      ))}
    </div>
  );
}
