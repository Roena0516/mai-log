'use client';

import { T } from '../lib/tokens';
import { GAMES, GAME_IDS } from '../lib/games';
import type { GameId } from '../lib/types';

interface GameTabsProps {
  active: GameId;
  onChange: (game: GameId) => void;
}

export default function GameTabs({ active, onChange }: GameTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.line}` }}>
      {GAME_IDS.map((id) => {
        const isActive = active === id;
        const accent = GAMES[id].accent;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderTop: isActive ? `2px solid ${accent}` : '2px solid transparent',
              borderBottom: '2px solid transparent',
              color: isActive ? T.text : T.muted,
              fontFamily: 'inherit',
              fontWeight: isActive ? 700 : 500,
              fontSize: 12,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginBottom: -1,
              whiteSpace: 'nowrap',
            }}
          >
            {GAMES[id].label}
          </button>
        );
      })}
    </div>
  );
}
