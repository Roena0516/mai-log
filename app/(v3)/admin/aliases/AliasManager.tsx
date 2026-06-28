"use client";

import { useMemo, useState } from "react";
import { T } from "../../lib/tokens";

interface Alias {
  id: string;
  title: string;
  alias: string;
}

interface SongItem {
  title: string;
  version: number;
  versionName: string;
  isNew: boolean;
}

type SortKey = "title" | "aliasCount" | "version";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "title", label: "이름순" },
  { key: "aliasCount", label: "별명 많은순" },
  { key: "version", label: "최신 버전순" },
];

interface Props {
  initialAliases: Alias[];
  songs: SongItem[];
}

export default function AliasManager({ initialAliases, songs }: Props) {
  const [aliases, setAliases] = useState<Alias[]>(initialAliases);
  const [selected, setSelected] = useState<string | null>(null);
  const [songSearch, setSongSearch] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [error, setError] = useState("");
  const [newOnly, setNewOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("title");

  const newCount = useMemo(() => songs.filter((s) => s.isNew).length, [songs]);

  // title -> 별명 갯수
  const aliasCountMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of aliases) m.set(a.title, (m.get(a.title) ?? 0) + 1);
    return m;
  }, [aliases]);

  const filteredSongs = useMemo(() => {
    let list = songs;
    if (newOnly) list = list.filter((s) => s.isNew);
    const q = songSearch.trim().toLowerCase();
    if (q) list = list.filter((s) => s.title.toLowerCase().includes(q));

    const sorted = [...list];
    if (sortKey === "aliasCount") {
      sorted.sort((a, b) => {
        const diff = (aliasCountMap.get(b.title) ?? 0) - (aliasCountMap.get(a.title) ?? 0);
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      });
    } else if (sortKey === "version") {
      sorted.sort((a, b) => {
        const diff = b.version - a.version;
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      });
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [songs, newOnly, songSearch, sortKey, aliasCountMap]);

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
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.line}`, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              placeholder="곡 검색"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => setNewOnly((v) => !v)}
                style={{
                  padding: "5px 10px",
                  background: newOnly ? T.text : "none",
                  border: `1px solid ${newOnly ? T.text : T.line}`,
                  color: newOnly ? "#fff" : T.muted,
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                신곡만 보기 ({newCount})
              </button>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                style={{
                  padding: "5px 8px",
                  background: T.surface,
                  border: `1px solid ${T.line}`,
                  color: T.text,
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  outline: "none",
                  marginLeft: "auto",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredSongs.length === 0 ? (
              <div style={{ padding: "20px 12px", fontSize: 12, color: T.muted, textAlign: "center" }}>
                검색 결과 없음
              </div>
            ) : (
              filteredSongs.map((s) => {
                const aliasCount = aliasCountMap.get(s.title) ?? 0;
                const isSelected = selected === s.title;
                return (
                  <div
                    key={s.title}
                    onClick={() => { setSelected(s.title); setNewAlias(""); setError(""); }}
                    style={{
                      padding: "9px 12px",
                      borderBottom: `1px solid ${T.line}`,
                      cursor: "pointer",
                      background: isSelected ? T.bg : T.surface,
                      borderLeft: isSelected ? `2px solid ${T.text}` : "2px solid transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {s.isNew && (
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "#e53e3e", padding: "1px 4px", borderRadius: 2, flexShrink: 0 }}>
                          NEW
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.title}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      {sortKey === "version" && (
                        <span style={{ fontSize: 10, color: T.muted }}>{s.versionName}</span>
                      )}
                      {aliasCount > 0 && (
                        <span style={{ fontSize: 10, color: T.muted }}>별명 {aliasCount}개</span>
                      )}
                    </div>
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
