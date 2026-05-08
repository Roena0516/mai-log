"use client";

import { useEffect, useState } from "react";
import { T } from "../lib/tokens";
import type { Song, GameId } from "../lib/types";
import { GAMES } from "../lib/games";
import {
  convertScore,
  buildDisplayMarks,
  convertDiff,
  MAI_CM_COLOR,
  GAME_CM_COLOR,
  MAI_DIFF_COLOR,
  GAME_DIFF_COLOR,
} from "../lib/scoreConvert";

const GAME_IDS: GameId[] = ["maimai", "chunithm", "sdvx", "arcaea"];

function displayLv(lv: number, game: GameId): string {
  if (game === "chunithm") return (Math.round((lv + 0.7) * 10) / 10).toFixed(1);
  if (game === "sdvx")
    return (Math.round((lv / 15.0) * 20.9 * 10) / 10).toFixed(1);
  if (game === "arcaea")
    return (Math.round((lv / 15.0) * 12.0 * 10) / 10).toFixed(1);
  return lv.toFixed(1);
}

interface SongModalProps {
  song: Song;
  onClose: () => void;
}

const FADE_MS = 160;

export default function SongModal({ song, onClose }: SongModalProps) {
  const [closing, setClosing] = useState(false);
  const [ytHover, setYtHover] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, FADE_MS);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const headerDiffColor = MAI_DIFF_COLOR[song.diff] ?? "#888";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: `${closing ? "modal-fade-out" : "modal-fade-in"} ${FADE_MS}ms ease both`,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          position: "relative",
          background: T.surface,
          border: `1px solid ${T.line}`,
          width: 460,
          maxWidth: "calc(100vw - 40px)",
          maxHeight: "calc(100vh - 60px)",
          overflowY: "auto",
          animation: `${closing ? "modal-slide-out" : "modal-slide-in"} ${FADE_MS}ms ease both`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Song header */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: `1px solid ${T.line}`,
          }}
        >
          {/* diff accent bar */}
          <div
            style={{ width: 3, background: headerDiffColor, flexShrink: 0 }}
          />

          <div style={{ flex: 1, minWidth: 0, padding: "14px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: headerDiffColor,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {song.diff}
              </span>
              <span style={{ fontSize: 9, color: T.muted }}>
                {song.isDx ? "DX" : "ST"}
              </span>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: T.text,
                letterSpacing: "-0.01em",
                marginBottom: 8,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {song.name}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: T.muted,
                    letterSpacing: "0.06em",
                    marginBottom: 1,
                  }}
                >
                  LEVEL
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: T.text,
                    lineHeight: 1,
                  }}
                >
                  {song.lv.toFixed(1)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: T.muted,
                    letterSpacing: "0.06em",
                    marginBottom: 1,
                  }}
                >
                  ACHIEVEMENT
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: T.text,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {song.ach.toFixed(4)}%
                </div>
              </div>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`maimai ${song.name} ${song.isDx ? "DX" : "ST"} ${song.diff} 外部出力`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setYtHover(true)}
                onMouseLeave={() => setYtHover(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 10px",
                  border: `1px solid ${T.line}`,
                  textDecoration: "none",
                  color: ytHover ? T.text : T.sub,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  flexShrink: 0,
                  marginLeft: "auto",
                  background: ytHover ? T.bg : "none",
                  transition: "color 0.12s, background 0.12s",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff0000">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z" />
                  <polygon fill="#fff" points="9.75,15.02 15.5,12 9.75,8.98" />
                </svg>
                {/* 外部出力 */}
                외부출력
              </a>
            </div>
          </div>

          {/* X button */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 24,
              height: 24,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.muted,
              fontSize: 20,
              lineHeight: 1,
              padding: 0,
              fontFamily: "inherit",
            }}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: T.line }} />

        {/* Game rows */}
        {GAME_IDS.map((gameId) => {
          const g = GAMES[gameId];
          const rs = g.formatRS(g.calcRS(song.ach, song.lv, song.marks));
          const score = convertScore(song.ach, gameId);
          const marks = buildDisplayMarks(song.ach, song.marks, gameId);
          const lvStr = displayLv(song.lv, gameId);
          const diffName =
            convertDiff(song.lv, gameId, song.diff, song.version) ?? song.diff;
          const diffColor =
            gameId !== "maimai"
              ? (GAME_DIFF_COLOR[gameId]?.[diffName] ?? "#888")
              : (MAI_DIFF_COLOR[song.diff] ?? "#888");
          const cmColors =
            gameId === "maimai"
              ? MAI_CM_COLOR
              : (GAME_CM_COLOR[gameId] ?? MAI_CM_COLOR);

          return (
            <div
              key={gameId}
              style={{
                display: "grid",
                gridTemplateColumns: "3px auto 1fr auto",
                alignItems: "center",
                borderBottom: `1px solid ${T.line}`,
                minHeight: 56,
              }}
            >
              {/* accent bar */}
              <div style={{ alignSelf: "stretch", background: g.accent }} />

              {/* game label */}
              <div
                style={{
                  padding: "0 12px",
                  borderRight: `1px solid ${T.line}`,
                  alignSelf: "stretch",
                  display: "flex",
                  alignItems: "center",
                  width: 130,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: g.accent,
                    letterSpacing: "0.04em",
                    // textWrap: "nowrap",
                  }}
                >
                  {g.label}
                </span>
              </div>

              {/* score + marks */}
              <div style={{ padding: "10px 14px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: diffColor,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Lv {lvStr}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.sub,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {score}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {marks.map((m) => (
                    <span
                      key={m}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: cmColors[m] ?? T.muted,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* rating value */}
              <div
                style={{
                  padding: "0 20px 0 0",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: T.muted,
                    letterSpacing: "0.08em",
                    marginBottom: 1,
                  }}
                >
                  {g.rsLabel}
                </div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    color: g.accent,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {rs}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
