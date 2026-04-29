'use client';

import { useState } from 'react';
import SongRow from '../components/SongRow';
import { SONGS } from '../lib/mockData';
import { GAMES } from '../lib/games';
import { T } from '../lib/tokens';
import { MAI_DIFF_COLOR } from '../lib/scoreConvert';
import type { DiffType } from '../lib/types';

const DIFF_OPTIONS: ('ALL' | DiffType)[] = ['ALL', 'BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'Re:MASTER'];

export default function ListPage() {
  const [activeDiff, setActiveDiff] = useState<'ALL' | DiffType>('ALL');

  const g = GAMES.maimai;
  const songs = (activeDiff === 'ALL' ? SONGS : SONGS.filter((s) => s.diff === activeDiff))
    .map((s) => ({ ...s, _rs: g.calcRS(s.ach, s.lv, s.marks) }));

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '10px 0',
          borderBottom: `1px solid ${T.line}`,
          flexWrap: 'wrap',
        }}
      >
        {DIFF_OPTIONS.map((d) => {
          const isActive = activeDiff === d;
          const color = d !== 'ALL' ? (MAI_DIFF_COLOR[d] ?? T.text) : T.text;
          return (
            <button
              key={d}
              onClick={() => setActiveDiff(d)}
              style={{
                padding: '3px 8px',
                background: 'none',
                border: `1px solid ${isActive ? color : T.line}`,
                color: isActive ? color : T.sub,
                fontFamily: 'inherit',
                fontWeight: isActive ? 700 : 400,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
      {songs.map((s, i) => (
        <SongRow key={i} song={s} game="maimai" />
      ))}
    </div>
  );
}
