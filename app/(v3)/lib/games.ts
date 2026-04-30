import type { GameId, Song, RecentLogEntry } from "./types";
import { maimaiRS, chunithumRS, sdvxRS, arcaeaRS } from "./ratingCalc";

type SongWithRS = Song & { _rs: number };

export interface GameConfig {
  id: GameId;
  label: string;
  accent: string;
  ratingLabel: string;
  rsLabel: string;
  calcRS: (ach: number, lv: number, marks: string[]) => number;
  formatRS: (v: number) => string;
  formatTotal: (v: number) => string;
  calcTotal: (songs: SongWithRS[], recentLogs?: RecentLogEntry[]) => number;
}

export const GAMES: Record<GameId, GameConfig> = {
  maimai: {
    id: "maimai",
    label: "maimai DX",
    accent: "#9333ea",
    ratingLabel: "RATING",
    rsLabel: "RATING",
    calcRS: maimaiRS,
    formatRS: (v) => String(v),
    formatTotal: (v) => String(v),
    calcTotal: (songs) => {
      const newTop = songs
        .filter((s) => s.isNewVersion)
        .sort((a, b) => b._rs - a._rs)
        .slice(0, 15);
      const oldTop = songs
        .filter((s) => !s.isNewVersion)
        .sort((a, b) => b._rs - a._rs)
        .slice(0, 35);
      return (
        newTop.reduce((s, r) => s + r._rs, 0) +
        oldTop.reduce((s, r) => s + r._rs, 0)
      );
    },
  },
  chunithm: {
    id: "chunithm",
    label: "CHUNITHM",
    accent: "#f97316",
    ratingLabel: "RATING",
    rsLabel: "RATING",
    calcRS: chunithumRS,
    formatRS: (v) => v.toFixed(2),
    formatTotal: (v) => v.toFixed(2),
    calcTotal: (songs) => {
      const newTop = songs
        .filter((s) => s.isNewVersion)
        .sort((a, b) => b._rs - a._rs)
        .slice(0, 20);
      const oldTop = songs
        .filter((s) => !s.isNewVersion)
        .sort((a, b) => b._rs - a._rs)
        .slice(0, 30);
      const sum = [...newTop, ...oldTop].reduce((s, r) => s + r._rs, 0);
      return Math.floor((sum / 50) * 100) / 100;
    },
  },
  sdvx: {
    id: "sdvx",
    label: "SOUND VOLTEX",
    accent: "#38bdf8",
    ratingLabel: "VOLFORCE",
    rsLabel: "VF",
    calcRS: sdvxRS,
    // 밀리-VF → VF (/ 1000)
    formatRS: (v) => (v / 1000).toFixed(3),
    formatTotal: (v) => (v / 1000).toFixed(3),
    calcTotal: (songs) => {
      return [...songs]
        .sort((a, b) => b._rs - a._rs)
        .slice(0, 50)
        .reduce((s, r) => s + r._rs, 0);
    },
  },
  arcaea: {
    id: "arcaea",
    label: "Arcaea",
    accent: "#a855f7",
    ratingLabel: "POTENTIAL",
    rsLabel: "PTT",
    calcRS: arcaeaRS,
    formatRS: (v) => v.toFixed(2),
    formatTotal: (v) => v.toFixed(2),
    calcTotal: (songs, recentLogs) => {
      if (recentLogs && recentLogs.length > 0) {
        // Recent: 최근 30판에서 곡+난이도별 최고 달성률 → 포텐셜 상위 10개
        const recentMap = new Map<string, RecentLogEntry>();
        for (const log of recentLogs.slice(0, 30)) {
          const key = `${log.name}|${log.isDx}|${log.diff}`;
          const existing = recentMap.get(key);
          if (!existing || log.ach > existing.ach) recentMap.set(key, log);
        }

        const recentTop10 = [...recentMap.values()]
          .map((log) => ({
            key: `${log.name}|${log.isDx}|${log.diff}`,
            _rs: arcaeaRS(log.ach, log.lv),
          }))
          .sort((a, b) => b._rs - a._rs)
          .slice(0, 10);

        const recentKeys = new Set(recentTop10.map((r) => r.key));

        // Best: Recent에 없는 전체 기록 상위 30개
        const best30 = songs
          .filter((s) => !recentKeys.has(`${s.name}|${s.isDx}|${s.diff}`))
          .sort((a, b) => b._rs - a._rs)
          .slice(0, 30);

        const sum =
          recentTop10.reduce((s, r) => s + r._rs, 0) +
          best30.reduce((s, r) => s + r._rs, 0);
        return Math.floor((sum / 40) * 100) / 100;
      }

      // recentLogs 없을 때: Best 40 / 40 근사
      const top40 = [...songs].sort((a, b) => b._rs - a._rs).slice(0, 40);
      const sum = top40.reduce((s, r) => s + r._rs, 0);
      return Math.floor((sum / 40) * 100) / 100;
    },
  },
};

export const GAME_IDS: GameId[] = ["maimai", "chunithm", "sdvx", "arcaea"];
