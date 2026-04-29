'use client';

import { usePathname } from 'next/navigation';
import { GameProvider } from '../context/GameContext';
import Sidebar from './Sidebar';
import { useGame } from '../context/GameContext';
import { GAMES } from '../lib/games';
import { T } from '../lib/tokens';
import type { ReactNode } from 'react';

const TITLE_MAP: Record<string, string> = {
  '/':          'mai·log',
  '/rating':   '레이팅 대상곡',
  '/log':      '플레이 기록',
  '/list':     '악곡 리스트',
  '/download': '다운로드',
};

function TopBar() {
  const pathname = usePathname();
  const { activeGame } = useGame();
  const title = TITLE_MAP[pathname] ?? 'mai·log';
  const isRating = pathname === '/v3/rating';

  return (
    <div
      style={{
        borderBottom: `1px solid ${T.line}`,
        background: T.surface,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 52,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: T.text,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {title}
        </h1>
        <span style={{ fontSize: 10, color: T.muted, letterSpacing: '0.06em' }}>
          {isRating ? GAMES[activeGame].label : 'maimai DX'}
        </span>
      </div>
    </div>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: T.surface,
        }}
      >
        <TopBar />
        <main style={{ flex: 1 }}>
          <div style={{ padding: '0 24px 48px' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function V3Shell({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      <ShellInner>{children}</ShellInner>
    </GameProvider>
  );
}
