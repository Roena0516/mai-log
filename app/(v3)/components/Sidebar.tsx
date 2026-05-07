"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame } from "../context/GameContext";
import { GAMES } from "../lib/games";
import { PROFILE } from "../lib/mockData";
import { useEffect, useState } from "react";

const NAV_LABELS = [
  { label: "레이팅", sub: "rating" },
  { label: "플레이 기록", sub: "log" },
  { label: "악곡 리스트", sub: "list" },
  { label: "다운로드", sub: "download" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeGame, convertedTotal, viewedUsername } = useGame();
  const g = GAMES[activeGame];
  const [profile, setProfile] = useState(PROFILE);

  useEffect(() => {
    const url = viewedUsername
      ? `/api/users/${viewedUsername}/profile`
      : "/api/users/me";
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (data.ok) setProfile(data.profile); });
  }, [viewedUsername]);

  const base = viewedUsername ? `/${viewedUsername}` : null;

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
      <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid #222" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: "-0.04em" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36,
              background: "#2a2a2a", border: "1px solid #333",
              flexShrink: 0, display: "flex", alignItems: "center",
              justifyContent: "center", overflow: "hidden",
            }}
          >
            {profile.iconUrl ? (
              <img src={profile.iconUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#555" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#555" />
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#555", letterSpacing: "0.06em", marginBottom: 2 }}>
              {profile.title}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              {profile.nickname}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {g.ratingLabel}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: g.accent, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {convertedTotal}
          </span>
        </div>

        <div>
          <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.04em" }}>
            PLAY COUNT&nbsp;&nbsp;
            <span style={{ color: "#999", fontWeight: 600 }}>{profile.playCountTotal}</span>
            {profile.playCountVersion && (
              <span style={{ color: "#444" }}> / {profile.playCountVersion}</span>
            )}
          </span>
        </div>
      </div>

      {/* nav */}
      <nav style={{ padding: "12px 0", flex: 1 }}>
        {NAV_LABELS.map(({ label, sub }) => {
          const href = base ? `${base}/${sub}` : `/${sub}`;
          const isActive = pathname === href || pathname.endsWith(`/${sub}`);
          return (
            <Link
              key={sub}
              href={href}
              style={{
                display: "block",
                width: "100%",
                padding: "9px 20px",
                background: "none",
                borderLeft: isActive ? `2px solid ${g.accent}` : "2px solid transparent",
                color: isActive ? "#fff" : "#555",
                fontFamily: "inherit",
                fontWeight: isActive ? 700 : 400,
                fontSize: 13,
                letterSpacing: "0.01em",
                textDecoration: "none",
                transition: "all 0.12s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a" }}>
        <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.08em" }}>maimai DX</span>
      </div>
    </aside>
  );
}
