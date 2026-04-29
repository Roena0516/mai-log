'use client';

import { T } from '../lib/tokens';
import { MAI_DIFF_COLOR } from '../lib/scoreConvert';
import type { GameId } from '../lib/types';

const SORT_OPTIONS = ['레이팅 점수', '달성률', '레벨'] as const;
const DIFF_OPTIONS = ['ALL', 'BASIC', 'ADVANCED', 'EXPERT', 'MASTER', 'Re:MASTER'] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
export type DiffOption = (typeof DIFF_OPTIONS)[number];

interface FilterBarProps {
  game: GameId;
  sort: SortOption;
  diff: DiffOption;
  onSortChange: (sort: SortOption) => void;
  onDiffChange: (diff: DiffOption) => void;
}

export default function FilterBar({ game, sort, diff, onSortChange, onDiffChange }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '10px 0',
        borderBottom: `1px solid ${T.line}`,
        flexWrap: 'wrap',
      }}
    >
      {/* sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: '0.06em', marginRight: 4 }}>
          정렬
        </span>
        {SORT_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSortChange(s)}
            style={{
              padding: '3px 8px',
              background: 'none',
              border: `1px solid ${sort === s ? T.text : T.line}`,
              color: sort === s ? T.text : T.sub,
              fontFamily: 'inherit',
              fontWeight: sort === s ? 700 : 400,
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.1s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* difficulty filter (maimai only) */}
      {game === 'maimai' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.muted, letterSpacing: '0.06em', marginRight: 4 }}>
            난이도
          </span>
          {DIFF_OPTIONS.map((d) => {
            const isActive = diff === d;
            const color = d !== 'ALL' ? (MAI_DIFF_COLOR[d] ?? T.text) : T.text;
            return (
              <button
                key={d}
                onClick={() => onDiffChange(d)}
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
      )}
    </div>
  );
}
