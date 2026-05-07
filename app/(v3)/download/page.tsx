'use client';

import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { toPng } from 'html-to-image';
import GameTabs from '../components/GameTabs';
import { GAMES } from '../lib/games';
import { T } from '../lib/tokens';
import {
  convertScore, buildDisplayMarks, convertDiff,
  MAI_DIFF_COLOR, GAME_DIFF_COLOR,
} from '../lib/scoreConvert';
import type { GameId, Song, RecentLogEntry, DiffType } from '../lib/types';

type SongWithRS = Song & { _rs: number };

interface CardSong {
  name: string;
  ach: number;
  lv: number;
  isDx?: boolean;
  diff: string;
  marks: string[];
  _rs: number;
}

function getDisplayLv(lv: number, game: GameId): string {
  if (game === 'chunithm') return (Math.round((lv + 0.7) * 10) / 10).toFixed(1);
  if (game === 'sdvx') return (Math.round((lv / 15.0) * 20.9 * 10) / 10).toFixed(1);
  if (game === 'arcaea') return (Math.round((lv / 15.0) * 12.0 * 10) / 10).toFixed(1);
  return lv.toFixed(1);
}

function getDiffColor(diff: string, lv: number, game: GameId): string {
  const convertedDiff = convertDiff(lv, game, diff as DiffType);
  const diffName = convertedDiff || diff;
  return game !== 'maimai'
    ? (GAME_DIFF_COLOR[game]?.[diffName] ?? '#888')
    : (MAI_DIFF_COLOR[diff] ?? '#888');
}

function RatingCard({ song, game, rank }: { song: CardSong; game: GameId; rank: number }) {
  const g = GAMES[game];
  const displayLv = getDisplayLv(song.lv, game);
  const scoreStr = convertScore(song.ach, game);
  const marks = buildDisplayMarks(song.ach, song.marks, game);
  const mark = marks[0] ?? '';
  const diffColor = getDiffColor(song.diff, song.lv, game);
  const rs = g.formatRS(song._rs);

  return (
    <div
      style={{
        width: 128,
        background: '#161616',
        borderTop: `3px solid ${diffColor}`,
        border: `1px solid #252525`,
        borderTopWidth: 3,
        display: 'flex',
        flexDirection: 'column',
        padding: '6px 8px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        flexShrink: 0,
        gap: 3,
      }}
    >
      {/* rank + DX/ST */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#444', letterSpacing: '0.06em' }}>#{rank}</span>
        {game === 'maimai' && (
          <span style={{
            fontSize: 8, fontWeight: 700, color: song.isDx ? '#f97316' : '#6b7280',
            letterSpacing: '0.06em',
          }}>
            {song.isDx ? 'DX' : 'ST'}
          </span>
        )}
      </div>

      {/* RS */}
      <div>
        <div style={{ fontSize: 8, color: '#555', letterSpacing: '0.1em', lineHeight: 1 }}>{g.rsLabel}</div>
        <div style={{
          fontSize: 24, fontWeight: 800, color: '#ffffff',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {rs}
        </div>
      </div>

      {/* song name */}
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, color: '#d4d4d4',
          lineHeight: 1.3, wordBreak: 'break-all',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {song.name}
        </span>
      </div>

      {/* bottom: lv + score, mark */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{
          fontSize: 9, color: '#777',
          letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          {displayLv} · {scoreStr}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: diffColor, letterSpacing: '0.04em' }}>
          {mark}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label, top, avgRs, game }: { label: string; top: number; avgRs?: number; game: GameId }) {
  const g = GAMES[game];
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 8,
      padding: '10px 0 5px',
      borderBottom: '1px solid #222',
      marginTop: 10,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: 10, color: '#444' }}>TOP {top}</span>
      {avgRs !== undefined && (
        <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>
          avg {g.formatRS(avgRs)}
        </span>
      )}
    </div>
  );
}

function CardGrid({ songs, game }: { songs: CardSong[]; game: GameId }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 128px)',
      gap: 4,
      marginTop: 6,
    }}>
      {songs.map((s, i) => (
        <RatingCard
          key={`${i}-${s.name}-${s.diff}-${s.isDx}`}
          song={s}
          game={game}
          rank={i + 1}
        />
      ))}
    </div>
  );
}

export default function DownloadPage() {
  const [activeGame, setActiveGame] = useState<GameId>('maimai');
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const { songs, recentLogs, recordsLoading: loading } = useGame();

  const handleSave = async () => {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0d0d0d',
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mailog-${activeGame}.png`;
      a.click();
    } finally {
      setSaving(false);
    }
  };

  const g = GAMES[activeGame];
  const withRS: SongWithRS[] = songs.map((s) => ({ ...s, _rs: g.calcRS(s.ach, s.lv, s.marks) }));

  // 게임별 섹션 계산
  type Section = { label: string; songs: CardSong[] };
  let sections: Section[] = [];

  if (activeGame === 'maimai' || activeGame === 'chunithm') {
    const [newTop, oldTop] = activeGame === 'maimai' ? [15, 35] : [20, 30];
    const threshold = g.newVersionThreshold ?? 0;
    const isNew = (s: SongWithRS) => (s.version ?? 0) >= threshold;
    sections = [
      {
        label: activeGame === 'maimai' ? '신곡' : '현행',
        songs: withRS.filter(isNew).sort((a, b) => b._rs - a._rs).slice(0, newTop),
      },
      {
        label: 'OTHERS',
        songs: withRS.filter((s) => !isNew(s)).sort((a, b) => b._rs - a._rs).slice(0, oldTop),
      },
    ];
  } else if (activeGame === 'sdvx') {
    sections = [{
      label: 'TOP',
      songs: [...withRS].sort((a, b) => b._rs - a._rs).slice(0, 50),
    }];
  } else {
    // arcaea
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
    const recentKeys = new Set(recentTop10.map((r) => `${r.name}|${r.isDx}|${r.diff}`));
    const best30 = withRS
      .filter((s) => !recentKeys.has(`${s.name}|${s.isDx}|${s.diff}`))
      .sort((a, b) => b._rs - a._rs)
      .slice(0, 30);
    sections = [
      { label: 'RECENT', songs: recentTop10 },
      { label: 'BEST', songs: best30 },
    ];
  }

  const totalRs = g.calcTotal(withRS, recentLogs);

  return (
    <div>
      <GameTabs active={activeGame} onChange={setActiveGame} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0' }}>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            padding: '8px 20px',
            background: T.text,
            color: '#fff',
            border: 'none',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.06em',
            cursor: saving || loading ? 'not-allowed' : 'pointer',
            opacity: saving || loading ? 0.4 : 1,
          }}
        >
          {saving ? 'SAVING…' : 'PNG 저장'}
        </button>
      </div>

      {/* capture target */}
      <div style={{ marginTop: 16, overflowX: 'auto' }}>
        <div
          ref={captureRef}
          style={{
            background: '#0d0d0d',
            padding: '16px 16px 20px',
            display: 'inline-block',
          }}
        >
          {/* 헤더 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
            borderBottom: '1px solid #222',
            minWidth: 688,
          }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>
                mai<span style={{ color: g.accent }}>·</span>log
              </span>
              <span style={{ fontSize: 11, color: '#555', marginLeft: 12, letterSpacing: '0.04em' }}>
                {g.label}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em' }}>{g.ratingLabel}</div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: g.accent,
                letterSpacing: '-0.02em', lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {g.formatTotal(totalRs)}
              </div>
            </div>
          </div>

          {/* 섹션들 */}
          {loading ? (
            <div style={{ padding: '40px 0', color: '#444', fontSize: 12, textAlign: 'center' }}>
              불러오는 중...
            </div>
          ) : sections.map((sec) => {
            const avgRs = sec.songs.length > 0
              ? Math.round(sec.songs.reduce((s, r) => s + r._rs, 0) / sec.songs.length * 100) / 100
              : 0;
            return (
              <div key={sec.label}>
                <SectionLabel
                  label={sec.label}
                  top={sec.songs.length}
                  avgRs={avgRs}
                  game={activeGame}
                />
                <CardGrid songs={sec.songs} game={activeGame} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
