import { useState } from 'react';
import { T } from '../lib/tokens';
import type { GameId } from '../lib/types';
import type { Song } from '../lib/types';
import {
  convertDiff, convertScore, buildDisplayMarks,
  MARK_SLOTS, MAI_CM_COLOR, GAME_CM_COLOR,
  MAI_DIFF_COLOR, GAME_DIFF_COLOR,
} from '../lib/scoreConvert';
import { getDisplayLv } from './LogFilterPanel';
import { GAMES } from '../lib/games';
import SongModal from './SongModal';

interface SongRowProps {
  song: Song;
  game: GameId;
  rank?: string | null;
}

export default function SongRow({ song, game, rank }: SongRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const g = GAMES[game];
  const convertedDiff = convertDiff(song.lv, game, song.diff, song.version);
  const diffName = convertedDiff || song.diff;

  const diffColor =
    game !== 'maimai'
      ? (GAME_DIFF_COLOR[game]?.[diffName] ?? '#888')
      : (MAI_DIFF_COLOR[song.diff] ?? '#888');

  const scoreStr = convertScore(song.ach, game);
  const displayMarks = buildDisplayMarks(song.ach, song.marks, game);
  const cmColors = game === 'maimai' ? MAI_CM_COLOR : (GAME_CM_COLOR[game] ?? MAI_CM_COLOR);
  const rs = g.formatRS(g.calcRS(song.ach, song.lv, song.marks));
  if (!Number.isFinite(song.lv)) return null;
  const displayLv = getDisplayLv(song.lv, game, song.name).toFixed(1);

  const slots = MARK_SLOTS[game];

  return (
    <>
    {modalOpen && <SongModal song={song} onClose={() => setModalOpen(false)} />}
    <div
      className="group"
      onClick={() => setModalOpen(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '3px 44px 1fr auto auto auto',
        alignItems: 'center',
        gap: 0,
        background: hovered ? T.bg : T.surface,
        borderBottom: `1px solid ${T.line}`,
        minHeight: 52,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      {/* diff accent bar */}
      <div style={{ alignSelf: 'stretch', background: diffColor }} />

      {/* level */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 10px',
          borderRight: `1px solid ${T.line}`,
          alignSelf: 'stretch',
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 600, color: T.muted, letterSpacing: '0.06em', lineHeight: 1 }}>Lv</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: T.text, lineHeight: 1.1, marginTop: 1 }}>{displayLv}</span>
      </div>

      {/* name + diff */}
      <div
        style={{
          padding: '0 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
          minWidth: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: diffColor,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {diffName}
          </span>
          {rank && (
            <span style={{ fontSize: 10, fontWeight: 500, color: T.muted, letterSpacing: '0.04em' }}>
              RATING {rank}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: T.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {song.name}
        </span>
      </div>

      {/* clear marks (fixed slots for vertical alignment) */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', flexShrink: 0 }}>
        {slots.map((slot) => {
          const hit = displayMarks.find(m => slot.includes(m));
          return (
            <span
              key={slot[0]}
              style={{
                display: 'inline-block',
                width: 34,
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: hit ? (cmColors[hit] ?? '#888') : 'transparent',
                userSelect: 'none',
              }}
            >
              {hit ?? slot[0]}
            </span>
          );
        })}
      </div>

      {/* score */}
      <div
        style={{
          padding: '0 14px',
          borderLeft: `1px solid ${T.line}`,
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          width: 120,
          justifyContent: 'flex-end',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.text,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}
        >
          {scoreStr}
        </span>
      </div>

      {/* RS */}
      <div
        style={{
          padding: '0 16px',
          borderLeft: `1px solid ${T.line}`,
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-end',
          minWidth: 80,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 600, color: T.muted, letterSpacing: '0.08em' }}>
          {g.rsLabel}
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: game !== 'maimai' ? g.accent : T.text,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.2,
          }}
        >
          {rs}
        </span>
      </div>
    </div>
    </>
  );
}
