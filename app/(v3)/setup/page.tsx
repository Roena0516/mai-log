"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { T } from "../lib/tokens";

export default function SetupPage() {
  const router = useRouter();
  const { update } = useSession();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/me/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error);
        return;
      }
      await update();
      router.push(`/${data.username}/rating`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: T.text,
            letterSpacing: "-0.02em",
          }}
        >
          Username 설정
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
          프로필 URL에 사용됩니다. 나중에 변경할 수 없습니다.
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: 280,
        }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              color: T.muted,
              pointerEvents: "none",
            }}
          >
            mai-log.roena.dev/
          </span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="username"
            maxLength={30}
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px 10px 148px",
              background: T.surface,
              border: `1px solid ${error ? "#dc2626" : T.line}`,
              color: T.text,
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && <div style={{ fontSize: 11, color: "#dc2626" }}>{error}</div>}

        <div style={{ fontSize: 10, color: T.muted }}>
          영소문자, 숫자, 하이픈(-) 사용 가능 · 3~30자
        </div>

        <button
          type="submit"
          disabled={loading || value.length < 3}
          style={{
            padding: "10px",
            background: T.text,
            color: "#ffffff",
            border: "none",
            fontFamily: "inherit",
            fontWeight: 500,
            fontSize: 13,
            cursor: loading || value.length < 3 ? "not-allowed" : "pointer",
            opacity: loading || value.length < 3 ? 0.4 : 1,
            letterSpacing: "0.06em",
          }}
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
