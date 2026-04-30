"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { GameId } from "../lib/types";

interface GameContextValue {
  activeGame: GameId;
  setActiveGame: (game: GameId) => void;
  convertedTotal: string;
  setConvertedTotal: (val: string) => void;
}

const GameContext = createContext<GameContextValue>({
  activeGame: "maimai",
  setActiveGame: () => {},
  convertedTotal: "",
  setConvertedTotal: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [activeGame, setActiveGame] = useState<GameId>("maimai");
  const [convertedTotal, setConvertedTotal] = useState("");
  return (
    <GameContext.Provider
      value={{ activeGame, setActiveGame, convertedTotal, setConvertedTotal }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
