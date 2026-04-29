'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import GameTabs from '../components/GameTabs';
import SongRow from '../components/SongRow';
import { GAMES } from '../lib/games';
import { SONGS, PROFILE } from '../lib/mockData';
import type { GameId } from '../lib/types';

export default function RatingPage() {
  const [activeGame, setActiveGame] = useState<GameId>('maimai');
  const { setActiveGame: setCtxGame, setConvertedTotal } = useGame();

  const updateGame = (game: GameId) => {
    setActiveGame(game);
    setCtxGame(game);

    const g = GAMES[game];
    if (game === 'maimai') {
      setConvertedTotal(PROFILE.maiRating);
    } else {
      const total = SONGS.reduce((sum, s) => sum + g.calcRS(s.ach, s.lv, s.marks), 0);
      setConvertedTotal(g.formatTotal(total));
    }
  };

  useEffect(() => {
    updateGame('maimai');
  }, []);

  const g = GAMES[activeGame];
  const songsWithRS = [...SONGS]
    .map((s) => ({ ...s, _rs: g.calcRS(s.ach, s.lv, s.marks) }))
    .sort((a, b) => b._rs - a._rs);

  return (
    <div>
      <GameTabs active={activeGame} onChange={updateGame} />
      <div>
        {songsWithRS.map((s, i) => (
          <SongRow
            key={i}
            song={s}
            game={activeGame}
            rank={`#${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
