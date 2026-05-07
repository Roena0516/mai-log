'use client';

import { useState } from 'react';
import FilterBar, { type SortOption, type DiffOption } from '../components/FilterBar';
import SongRow from '../components/SongRow';
import { GAMES } from '../lib/games';
import { T } from '../lib/tokens';
import { useGame } from '../context/GameContext';

export default function LogPage() {
  const [sort, setSort] = useState<SortOption>('레이팅 점수');
  const [diff, setDiff] = useState<DiffOption>('ALL');
  const { songs, recordsLoading: loading } = useGame();

  const g = GAMES.maimai;

  let filtered = songs.map((s) => ({ ...s, _rs: g.calcRS(s.ach, s.lv, s.marks) }));

  if (diff !== 'ALL') {
    filtered = filtered.filter((s) => s.diff === diff);
  }

  if (sort === '레이팅 점수') {
    filtered.sort((a, b) => b._rs - a._rs);
  } else if (sort === '달성률') {
    filtered.sort((a, b) => b.ach - a.ach);
  } else {
    filtered.sort((a, b) => b.lv - a.lv);
  }

  if (loading) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: T.sub, fontSize: 13 }}>불러오는 중...</div>;
  }

  if (songs.length === 0) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: T.sub, fontSize: 13 }}>북마클릿으로 기록을 수집하면 여기에 표시됩니다.</div>;
  }

  return (
    <div>
      <FilterBar
        game="maimai"
        sort={sort}
        diff={diff}
        onSortChange={setSort}
        onDiffChange={setDiff}
      />
      {filtered.map((s) => (
        <SongRow key={`${s.name}-${s.diff}-${s.isDx}`} song={s} game="maimai" />
      ))}
    </div>
  );
}
