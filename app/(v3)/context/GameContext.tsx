"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { GameId, Song, RecentLogEntry } from "../lib/types";

interface GameContextValue {
  activeGame: GameId;
  setActiveGame: (game: GameId) => void;
  convertedTotal: string;
  setConvertedTotal: (val: string) => void;
  songs: Song[];
  recentLogs: RecentLogEntry[];
  recordsLoading: boolean;
  refreshRecords: () => void;
}

const GameContext = createContext<GameContextValue>({
  activeGame: "maimai",
  setActiveGame: () => {},
  convertedTotal: "",
  setConvertedTotal: () => {},
  songs: [],
  recentLogs: [],
  recordsLoading: true,
  refreshRecords: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [activeGame, setActiveGame] = useState<GameId>("maimai");
  const [convertedTotal, setConvertedTotal] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLogEntry[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  const fetchRecords = () => {
    setRecordsLoading(true);
    fetch("/api/records")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setSongs(data.songs);
          setRecentLogs(data.recentLogs ?? []);
        }
      })
      .finally(() => setRecordsLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <GameContext.Provider
      value={{
        activeGame, setActiveGame,
        convertedTotal, setConvertedTotal,
        songs, recentLogs, recordsLoading,
        refreshRecords: fetchRecords,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
