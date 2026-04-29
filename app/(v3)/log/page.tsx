'use client';

import { useState } from 'react';
import FilterBar, { type SortOption, type DiffOption } from '../components/FilterBar';
import SongRow from '../components/SongRow';
import { SONGS } from '../lib/mockData';
import { GAMES } from '../lib/games';

export default function LogPage() {
  const [sort, setSort] = useState<SortOption>('레이팅 점수');
  const [diff, setDiff] = useState<DiffOption>('ALL');

  const g = GAMES.maimai;

  let songs = SONGS.map((s) => ({ ...s, _rs: g.calcRS(s.ach, s.lv) }));

  if (diff !== 'ALL') {
    songs = songs.filter((s) => s.diff === diff);
  }

  if (sort === '레이팅 점수') {
    songs.sort((a, b) => b._rs - a._rs);
  } else if (sort === '달성률') {
    songs.sort((a, b) => b.ach - a.ach);
  } else {
    songs.sort((a, b) => b.lv - a.lv);
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
      {songs.map((s, i) => (
        <SongRow key={i} song={s} game="maimai" />
      ))}
    </div>
  );
}
