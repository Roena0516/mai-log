"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { GameId, Song, RecentLogEntry } from "../lib/types";

const SYSTEM_SEGMENTS = new Set([
  "rating", "log", "list", "download", "sync", "api", "auth",
  "admin", "settings", "profile", "me", "user", "users",
]);

function extractUsername(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const first = segments[0];
  if (SYSTEM_SEGMENTS.has(first)) return null;
  return first;
}

interface GameContextValue {
  activeGame: GameId;
  setActiveGame: (game: GameId) => void;
  convertedTotal: string;
  setConvertedTotal: (val: string) => void;
  songs: Song[];
  recentLogs: RecentLogEntry[];
  recordsLoading: boolean;
  refreshRecords: () => void;
  viewedUsername: string | null;
  ownUsername: string | null;
  isOwnProfile: boolean;
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
  viewedUsername: null,
  ownUsername: null,
  isOwnProfile: true,
});

export function GameProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const viewedUsername = extractUsername(pathname);

  const [activeGame, setActiveGame] = useState<GameId>("maimai");
  const [convertedTotal, setConvertedTotal] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLogEntry[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [ownUsername, setOwnUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOwnUsername(data.profile.username ?? null);
      });
  }, []);

  const fetchRecords = () => {
    setRecordsLoading(true);
    const url = viewedUsername
      ? `/api/users/${viewedUsername}/records`
      : "/api/records";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setSongs(data.songs);
          setRecentLogs(data.recentLogs ?? []);
        }
      })
      .finally(() => setRecordsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRecords(); }, [viewedUsername]);

  const isOwnProfile = ownUsername !== null && ownUsername === viewedUsername;

  return (
    <GameContext.Provider
      value={{
        activeGame, setActiveGame,
        convertedTotal, setConvertedTotal,
        songs, recentLogs, recordsLoading,
        refreshRecords: fetchRecords,
        viewedUsername,
        ownUsername,
        isOwnProfile,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
