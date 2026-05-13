"use client";

import { useState } from "react";
import { T } from "../../lib/tokens";

interface Alias {
  id: string;
  title: string;
  alias: string;
}

interface Props {
  initialAliases: Alias[];
  songTitles: string[];
}

export default function AliasManager({ initialAliases, songTitles }: Props) {
  const [aliases, setAliases] = useState<Alias[]>(initialAliases);
  const [selected, setSelected] = useState<string | null>(null);
  const [songSearch, setSongSearch] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [error, setError] = useState("");

  const filteredSongs = songSearch.trim()
    ? songTitles.filter((t) => t.toLowerCase().includes(songSearch.trim().toLowerCase()))
    : songTitles;

  const selectedAliases = selected ? aliases.filter((a) => a.title === selected) : [];

  const handleAdd = async () => {
    if (!selected || !newAlias.trim()) return;
    setError("");
    const res = await fetch("/api/admin/aliases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: selected, alias: newAlias.trim() }),
    });
    const data = await res.json();
    if (!data.ok) { setError(data.error ?? "오류가 발생했습니다"); return; }
    setAliases((prev) => [...prev, data.alias]);
    setNewAlias("");
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/aliases/${id}`, { method: "DELETE" });
    if ((await res.json()).ok) setAliases((prev) => prev.filter((a) => a.id !== id));
  };

  const inputStyle: React.CSSProperties = {
    padding: "7px 10px",
    background: T.surface,
    border: `1px solid ${T.line}`,
    color: T.text,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 760, padding: "32px 0 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.1em", marginBottom: 6 }}>
          ADMIN
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", margin: 0 }}>
          곡 별명 관리
        </h1>
      </div>

      <div style={{ display: "flex", gap: 1, background: T.line, height: 600 }}>
        {/* 곡 목록 */}
        <div style={{ width: 320, flexShrink: 0, background: T.surface, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.line}` }}>
            <input
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              placeholder="곡 검색"
              style={inputStyle}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredSongs.length === 0 ? (
              <div style={{ padding: "20px 12px", fontSize: 12, color: T.muted, textAlign: "center" }}>
                검색 결과 없음
              </div>
            ) : (
              filteredSongs.map((title) => {
                const aliasCount = aliases.filter((a) => a.title === title).length;
                const isSelected = selected === title;
                return (
                  <div
                    key={title}
                    onClick={() => { setSelected(title); setNewAlias(""); setError(""); }}
                    style={{
                      padding: "9px 12px",
                      borderBottom: `1px solid ${T.line}`,
                      cursor: "pointer",
                      background: isSelected ? T.bg : T.surface,
                      borderLeft: isSelected ? `2px solid ${T.text}` : "2px solid transparent",
                    }}
                  >
                    <div style={{ fontSize: 12, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {title}
                    </div>
                    {aliasCount > 0 && (
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                        별명 {aliasCount}개
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 별명 편집 패널 */}
        <div style={{ flex: 1, background: T.surface, display: "flex", flexDirection: "column" }}>
          {selected ? (
            <>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 3 }}>선택된 곡</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{selected}</div>
              </div>

              {/* 기존 별명 목록 */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                {selectedAliases.length === 0 ? (
                  <div style={{ padding: "20px 16px", fontSize: 12, color: T.muted }}>
                    등록된 별명이 없습니다
                  </div>
                ) : (
                  selectedAliases.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 16px",
                        borderBottom: `1px solid ${T.line}`,
                      }}
                    >
                      <span style={{ fontSize: 13, color: T.text }}>{a.alias}</span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{
                          padding: "2px 10px",
                          background: "none",
                          border: `1px solid ${T.line}`,
                          color: T.muted,
                          fontFamily: "inherit",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* 별명 추가 입력 */}
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.line}` }}>
                {error && <div style={{ fontSize: 11, color: "#e53e3e", marginBottom: 6 }}>{error}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="새 별명 입력"
                    style={{ ...inputStyle, flex: 1, width: "auto" }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!newAlias.trim()}
                    style={{
                      padding: "7px 16px",
                      background: T.text,
                      color: "#fff",
                      border: "none",
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      flexShrink: 0,
                      opacity: !newAlias.trim() ? 0.4 : 1,
                    }}
                  >
                    추가
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: T.muted }}>
              왼쪽에서 곡을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
