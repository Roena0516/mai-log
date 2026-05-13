"use client";

import { useState, useEffect, useRef } from "react";
import GameTabs from "../../components/GameTabs";
import SongRow from "../../components/SongRow";
import LogFilterPanel, {
  DEFAULT_FILTER,
  type LogFilter,
  getDisplayLv,
} from "../../components/LogFilterPanel";
import { GAMES } from "../../lib/games";
import { T } from "../../lib/tokens";
import { convertDiff } from "../../lib/scoreConvert";
import { useGame } from "../../context/GameContext";
import type { GameId } from "../../lib/types";

const PAGE_SIZE = 30;

function matchesCombo(marks: string[], combo: string): boolean {
  if (!combo) return true;
  const hasAP_p = marks.includes("AP+");
  const hasAP = hasAP_p || marks.includes("AP");
  const hasFC_p = hasAP || marks.includes("FC+");
  const hasFC = hasFC_p || marks.includes("FC");
  if (combo === "none") return !hasFC;
  if (combo === "FC") return hasFC;
  if (combo === "FC+") return hasFC_p;
  if (combo === "AP") return hasAP;
  if (combo === "AP+") return hasAP_p;
  return true;
}

function matchesSync(marks: string[], sync: string): boolean {
  if (!sync) return true;
  const hasFSD_p = marks.includes("FSD+");
  const hasFSD = hasFSD_p || marks.includes("FSD");
  const hasFS_p = hasFSD || marks.includes("FS+");
  const hasFS = hasFS_p || marks.includes("FS");
  const hasSYNC = hasFS || marks.includes("SYNC");
  if (sync === "none") return !hasSYNC;
  if (sync === "SYNC") return hasSYNC;
  if (sync === "FS") return hasFS;
  if (sync === "FS+") return hasFS_p;
  if (sync === "FSD") return hasFSD;
  if (sync === "FSD+") return hasFSD_p;
  return true;
}

export default function LogPage() {
  const [activeGame, setActiveGame] = useState<GameId>("maimai");
  const [filter, setFilter] = useState<LogFilter>(DEFAULT_FILTER);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [aliasMap, setAliasMap] = useState<Map<string, string[]>>(new Map());
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/aliases")
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) return;
        const map = new Map<string, string[]>();
        for (const { title, alias } of data.aliases) {
          const list = map.get(title) ?? [];
          list.push(alias);
          map.set(title, list);
        }
        setAliasMap(map);
      });
  }, []);

  const { setActiveGame: setCtxGame, setConvertedTotal, songs, recentLogs, recordsLoading: loading } = useGame();

  const g = GAMES[activeGame];

  const handleGameChange = (game: GameId) => {
    setActiveGame(game);
    setCtxGame(game);
    setFilter(DEFAULT_FILTER);
    setVisibleCount(PAGE_SIZE);
    const withRS = songs.map((s) => ({ ...s, _rs: GAMES[game].calcRS(s.ach, s.lv, s.marks) }));
    setConvertedTotal(GAMES[game].formatTotal(GAMES[game].calcTotal(withRS, recentLogs)));
  };

  const handleFilterChange = (f: LogFilter) => {
    setFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  // compute filtered list
  let filtered = songs
    .map((s) => ({
      ...s,
      _rs: g.calcRS(s.ach, s.lv, s.marks),
      _displayLv: getDisplayLv(s.lv, activeGame, s.name),
      _convertedDiff: convertDiff(s.lv, activeGame, s.diff, s.version) ?? s.diff,
    }))
    .filter((s) => Number.isFinite(s.lv));

  // sort
  if (filter.sort === "rating") filtered.sort((a, b) => b._rs - a._rs);
  else if (filter.sort === "ach") filtered.sort((a, b) => b.ach - a.ach);
  else filtered.sort((a, b) => b._displayLv - a._displayLv);

  // filters
  if (filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    filtered = filtered.filter((s) => {
      if (s.name.toLowerCase().includes(q)) return true;
      return (aliasMap.get(s.name) ?? []).some((a) => a.toLowerCase().includes(q));
    });
  }
  if (filter.lvMin) filtered = filtered.filter((s) => s._displayLv >= parseFloat(filter.lvMin));
  if (filter.lvMax) filtered = filtered.filter((s) => s._displayLv <= parseFloat(filter.lvMax));
  if (filter.achMin) filtered = filtered.filter((s) => s.ach >= parseFloat(filter.achMin));
  if (filter.achMax) filtered = filtered.filter((s) => s.ach <= parseFloat(filter.achMax));
  if (filter.combo) filtered = filtered.filter((s) => matchesCombo(s.marks, filter.combo));
  if (activeGame === "maimai" && filter.sync)
    filtered = filtered.filter((s) => matchesSync(s.marks, filter.sync));
  if (activeGame === "maimai" && filter.chartType !== "ALL")
    filtered = filtered.filter((s) => (filter.chartType === "DX") === s.isDx);
  if (filter.diff)
    filtered = filtered.filter((s) => s._convertedDiff === filter.diff);

  // infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: T.sub, fontSize: 13 }}>
        불러오는 중...
      </div>
    );
  }
  if (songs.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: T.sub, fontSize: 13 }}>
        북마클릿으로 기록을 수집하면 여기에 표시됩니다.
      </div>
    );
  }

  const visible = filtered.slice(0, visibleCount);

  return (
    <div>
      <GameTabs active={activeGame} onChange={handleGameChange} />
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {visible.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: T.sub, fontSize: 13 }}>
              조건에 맞는 곡이 없습니다.
            </div>
          ) : (
            visible.map((s) => (
              <SongRow key={`${s.name}-${s.diff}-${s.isDx}`} song={s} game={activeGame} />
            ))
          )}
          {visibleCount < filtered.length && <div ref={sentinelRef} style={{ height: 1 }} />}
        </div>
        <LogFilterPanel
          game={activeGame}
          filter={filter}
          onChange={handleFilterChange}
          totalCount={songs.length}
          filteredCount={filtered.length}
        />
      </div>
    </div>
  );
}
