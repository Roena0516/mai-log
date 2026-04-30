"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame } from "../context/GameContext";
import { GAMES } from "../lib/games";
import { PROFILE } from "../lib/mockData";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "레이팅", href: "/rating" },
  { label: "플레이 기록", href: "/log" },
  { label: "악곡 리스트", href: "/list" },
  { label: "다운로드", href: "/download" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeGame, convertedTotal } = useGame();
  const g = GAMES[activeGame];
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(PROFILE);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setProfile(data.profile);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        background: "#111111",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* wordmark */}
      <div
        style={{ padding: "22px 20px 16px", borderBottom: "1px solid #222" }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: 18,
              color: "#fff",
              letterSpacing: "-0.04em",
            }}
          >
            mai<span style={{ color: g.accent }}>·</span>log
          </span>
        </Link>
      </div>

      {/* profile */}
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#2a2a2a",
              border: "1px solid #333",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#555" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#555" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "#555",
                letterSpacing: "0.06em",
                marginBottom: 2,
              }}
            >
              {profile.title}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              {profile.nickname}
            </div>
          </div>
        </div>

        {/* rating */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "#555",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {g.ratingLabel}
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: g.accent,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {convertedTotal}
          </span>
        </div>

        {/* play count */}
        <div>
          <span
            style={{ fontSize: 10, color: "#555", letterSpacing: "0.04em" }}
          >
            PLAY COUNT&nbsp;&nbsp;
            <span style={{ color: "#999", fontWeight: 600 }}>
              {profile.playCountTotal}
            </span>
            {profile.playCountVersion && (
              <span style={{ color: "#444" }}>
                {" "}
                / {profile.playCountVersion}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* nav */}
      <nav style={{ padding: "12px 0", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                width: "100%",
                padding: "9px 20px",
                background: "none",
                borderLeft: isActive
                  ? `2px solid ${g.accent}`
                  : "2px solid transparent",
                color: isActive ? "#fff" : "#555",
                fontFamily: "inherit",
                fontWeight: isActive ? 700 : 400,
                fontSize: 13,
                letterSpacing: "0.01em",
                textDecoration: "none",
                transition: "all 0.12s",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a" }}>
        <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.08em" }}>
          maimai DX
        </span>
      </div>
    </aside>
  );
}
