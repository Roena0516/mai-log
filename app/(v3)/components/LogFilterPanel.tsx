"use client";

import { useState, useEffect } from "react";
import type { GameId } from "../lib/types";
import { T } from "../lib/tokens";

export interface LogFilter {
  search: string;
  lvMin: string;
  lvMax: string;
  achMin: string;
  achMax: string;
  combo: string;
  sync: string;
  chartType: "ALL" | "ST" | "DX";
  diff: string;
  sort: "rating" | "ach" | "lv";
}

export const DEFAULT_FILTER: LogFilter = {
  search: "",
  lvMin: "",
  lvMax: "",
  achMin: "",
  achMax: "",
  combo: "",
  sync: "",
  chartType: "ALL",
  diff: "",
  sort: "rating",
};

const SDVX_LV15_MAP: Record<string, number> = {
  "PANDORA PARADOXXX": 20.0,
  系ぎて: 20.5,
  "Xaleid◆scopiX": 20.9,
};

export function getDisplayLv(lv: number, game: GameId, name?: string): number {
  if (game === "chunithm") return Math.round((lv + 0.7) * 10) / 10;
  if (game === "sdvx") {
    if (lv >= 15 && name !== undefined && SDVX_LV15_MAP[name] !== undefined)
      return SDVX_LV15_MAP[name];
    return Math.round((1 + (lv - 1) * (18.9 / 13.9)) * 10) / 10;
  }
  if (game === "arcaea") return Math.round((lv / 15.0) * 12.0 * 10) / 10;
  return lv;
}

const LV_PRESETS: Record<
  GameId,
  { label: string; min?: number; max?: number }[]
> = {
  maimai: [
    { label: "전체" },
    { label: "~10+", max: 10.9 },
    { label: "11", min: 11.0, max: 11.4 },
    { label: "11+", min: 11.5, max: 11.9 },
    { label: "12", min: 12.0, max: 12.4 },
    { label: "12+", min: 12.5, max: 12.9 },
    { label: "13", min: 13.0, max: 13.4 },
    { label: "13+", min: 13.5, max: 13.9 },
    { label: "14", min: 14.0, max: 14.4 },
    { label: "14+", min: 14.5, max: 14.9 },
    { label: "15", min: 15.0 },
  ],
  chunithm: [
    { label: "전체" },
    { label: "~13", max: 13.4 },
    { label: "13+", min: 13.5, max: 13.9 },
    { label: "14", min: 14.0, max: 14.4 },
    { label: "14+", min: 14.5, max: 14.9 },
    { label: "15", min: 15.0, max: 15.4 },
    { label: "15+", min: 15.5 },
  ],
  sdvx: [
    { label: "전체" },
    { label: "~16", max: 16.9 },
    { label: "17", min: 17.0, max: 17.9 },
    { label: "18", min: 18.0, max: 18.9 },
    { label: "19", min: 19.0, max: 19.9 },
    { label: "20", min: 20.0 },
  ],
  arcaea: [
    { label: "전체" },
    { label: "~9", max: 9.4 },
    { label: "9+", min: 9.5, max: 9.9 },
    { label: "10", min: 10.0, max: 10.4 },
    { label: "10+", min: 10.5, max: 10.9 },
    { label: "11", min: 11.0, max: 11.4 },
    { label: "11+", min: 11.5, max: 11.9 },
    { label: "12", min: 12.0 },
  ],
};

const ACH_PRESETS: Record<
  GameId,
  { label: string; min?: number; max?: number }[]
> = {
  maimai: [
    { label: "전체" },
    { label: "~AAA", max: 93.9999 },
    { label: "S", min: 97.0, max: 97.9999 },
    { label: "S+", min: 98.0, max: 98.9999 },
    { label: "SS", min: 99.0, max: 99.4999 },
    { label: "SS+", min: 99.5, max: 99.9999 },
    { label: "SSS", min: 100.0, max: 100.4999 },
    { label: "SSS+", min: 100.5 },
  ],
  chunithm: [
    { label: "전체" },
    { label: "~S", max: 97.4999 },
    { label: "S", min: 97.5, max: 99.9999 },
    { label: "SS", min: 100.0, max: 100.4999 },
    { label: "SS+", min: 100.5, max: 100.7499 },
    { label: "SSS", min: 100.75, max: 100.8999 },
    { label: "SSS+", min: 100.9 },
  ],
  sdvx: [
    { label: "전체" },
    { label: "~A", max: 90.8999 },
    { label: "A", min: 90.9, max: 93.9299 },
    { label: "AA", min: 93.93, max: 95.9499 },
    { label: "AA+", min: 95.95, max: 97.9699 },
    { label: "AAA", min: 97.97, max: 98.9799 },
    { label: "AAA+", min: 98.98, max: 99.9899 },
    { label: "S", min: 99.99 },
  ],
  arcaea: [
    { label: "전체" },
    { label: "~B", max: 89.8899 },
    { label: "B", min: 89.89, max: 92.9199 },
    { label: "A", min: 92.92, max: 95.9499 },
    { label: "AA", min: 95.95, max: 98.9799 },
    { label: "EX", min: 98.98, max: 99.9899 },
    { label: "EX+", min: 99.99 },
  ],
};

const COMBO_PRESETS: Record<GameId, { label: string; value: string }[]> = {
  maimai: [
    { label: "전체", value: "" },
    { label: "N/A", value: "none" },
    { label: "FC", value: "FC" },
    { label: "FC+", value: "FC+" },
    { label: "AP", value: "AP" },
    { label: "AP+", value: "AP+" },
  ],
  chunithm: [
    { label: "전체", value: "" },
    { label: "N/A", value: "none" },
    { label: "FC", value: "FC" },
    { label: "FC+", value: "FC+" },
    { label: "AJ", value: "AP" },
    { label: "AJC", value: "AP+" },
  ],
  sdvx: [
    { label: "전체", value: "" },
    { label: "N/A", value: "none" },
    { label: "UC", value: "FC" },
    { label: "PUC", value: "AP" },
  ],
  arcaea: [
    { label: "전체", value: "" },
    { label: "N/A", value: "none" },
    { label: "F", value: "FC" },
    { label: "P", value: "AP" },
  ],
};

const SYNC_PRESETS = [
  { label: "전체", value: "" },
  { label: "N/A", value: "none" },
  { label: "SYNC", value: "SYNC" },
  { label: "FS", value: "FS" },
  { label: "FS+", value: "FS+" },
  { label: "FDX", value: "FSD" },
  { label: "FDX+", value: "FSD+" },
];

const DIFF_PRESETS: Record<GameId, { label: string; value: string }[]> = {
  maimai: [
    { label: "전체", value: "" },
    { label: "BAS", value: "BASIC" },
    { label: "ADV", value: "ADVANCED" },
    { label: "EXP", value: "EXPERT" },
    { label: "MAS", value: "MASTER" },
    { label: "Re:MAS", value: "Re:MASTER" },
  ],
  chunithm: [
    { label: "전체", value: "" },
    { label: "BAS", value: "BASIC" },
    { label: "ADV", value: "ADVANCED" },
    { label: "EXP", value: "EXPERT" },
    { label: "MAS", value: "MASTER" },
    { label: "ULT", value: "ULTIMA" },
  ],
  sdvx: [
    { label: "전체", value: "" },
    { label: "NOV", value: "NOVICE" },
    { label: "ADV", value: "ADVANCED" },
    { label: "EXH", value: "EXHAUST" },
    { label: "MXM", value: "MAXIMUM" },
    { label: "INF", value: "INFINITE" },
    { label: "GRV", value: "GRAVITY" },
    { label: "HVN", value: "HEAVENLY" },
    { label: "VVD", value: "VIVID" },
    { label: "XCD", value: "EXCEED" },
    { label: "NBL", value: "NABLA" },
  ],
  arcaea: [
    { label: "전체", value: "" },
    { label: "PST", value: "Past" },
    { label: "PRS", value: "Present" },
    { label: "FTR", value: "Future" },
    { label: "ETR", value: "Eternal" },
  ],
};

const SORT_OPTIONS = [
  { label: "레이팅", value: "rating" as const },
  { label: "달성률", value: "ach" as const },
  { label: "레벨", value: "lv" as const },
];

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${T.line}`, padding: "10px 14px" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.muted,
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Chips({
  items,
  value,
  onChange,
}: {
  items: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            style={{
              padding: "2px 8px",
              background: active ? T.text : "none",
              border: `1px solid ${active ? T.text : T.line}`,
              color: active ? "#fff" : T.sub,
              fontFamily: "inherit",
              fontWeight: 400,
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function RangeWithPresets({
  minValue,
  maxValue,
  onRangeChange,
  presets,
  placeholder,
}: {
  minValue: string;
  maxValue: string;
  onRangeChange: (min: string, max: string) => void;
  presets: { label: string; min?: number; max?: number }[];
  placeholder?: [string, string];
}) {
  const [clickStart, setClickStart] = useState<number | null>(null);

  useEffect(() => {
    if (!minValue && !maxValue) setClickStart(null);
  }, [minValue, maxValue]);

  const handlePresetClick = (idx: number) => {
    const p = presets[idx];
    if (p.label === "전체") {
      onRangeChange("", "");
      setClickStart(null);
      return;
    }
    if (clickStart === null) {
      setClickStart(idx);
      onRangeChange(
        p.min !== undefined ? String(p.min) : "",
        p.max !== undefined ? String(p.max) : "",
      );
    } else if (clickStart === idx) {
      onRangeChange("", "");
      setClickStart(null);
    } else {
      const [s, e] = clickStart < idx ? [clickStart, idx] : [idx, clickStart];
      let hasUnboundedMin = false,
        hasUnboundedMax = false;
      let minVal = Infinity,
        maxVal = -Infinity;
      for (let i = s; i <= e; i++) {
        const pr = presets[i];
        if (pr.min === undefined) hasUnboundedMin = true;
        else minVal = Math.min(minVal, pr.min);
        if (pr.max === undefined) hasUnboundedMax = true;
        else maxVal = Math.max(maxVal, pr.max);
      }
      onRangeChange(
        hasUnboundedMin ? "" : String(minVal),
        hasUnboundedMax ? "" : String(maxVal),
      );
      setClickStart(null);
    }
  };

  const isActive = (idx: number): boolean => {
    const p = presets[idx];
    if (p.label === "전체") return !minValue && !maxValue;
    if (!minValue && !maxValue) return false;
    const curMin = minValue ? parseFloat(minValue) : -Infinity;
    const curMax = maxValue ? parseFloat(maxValue) : Infinity;
    const pMin = p.min !== undefined ? p.min : -Infinity;
    const pMax = p.max !== undefined ? p.max : Infinity;
    return pMin >= curMin && pMax <= curMax;
  };

  const inputStyle: React.CSSProperties = {
    width: "calc(50% - 10px)",
    padding: "5px 6px",
    background: T.bg,
    border: `1px solid ${T.line}`,
    color: T.text,
    fontSize: 11,
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="number"
          value={minValue}
          onChange={(e) => {
            onRangeChange(e.target.value, maxValue);
            setClickStart(null);
          }}
          placeholder={placeholder?.[0] ?? "최소"}
          style={inputStyle}
        />
        <span style={{ color: T.muted, fontSize: 10, flexShrink: 0 }}>···</span>
        <input
          type="number"
          value={maxValue}
          onChange={(e) => {
            onRangeChange(minValue, e.target.value);
            setClickStart(null);
          }}
          placeholder={placeholder?.[1] ?? "최대"}
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {presets.map((p, idx) => {
          const active = isActive(idx);
          return (
            <button
              key={p.label}
              onClick={() => handlePresetClick(idx)}
              style={{
                padding: "2px 8px",
                background: active ? T.text : "none",
                border: `1px solid ${active ? T.text : T.line}`,
                color: active ? "#fff" : T.sub,
                fontFamily: "inherit",
                fontWeight: 400,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface LogFilterPanelProps {
  game: GameId;
  filter: LogFilter;
  onChange: (f: LogFilter) => void;
  totalCount: number;
  filteredCount: number;
}

export default function LogFilterPanel({
  game,
  filter,
  onChange,
  totalCount,
  filteredCount,
}: LogFilterPanelProps) {
  const set = <K extends keyof LogFilter>(key: K, value: LogFilter[K]) =>
    onChange({ ...filter, [key]: value });

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        borderLeft: `1px solid ${T.line}`,
        overflowY: "auto",
        height: "calc(100vh - 90px)",
        position: "sticky",
        top: 90,
        alignSelf: "flex-start",
      }}
    >
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.line}` }}>
        <span style={{ fontSize: 10, color: T.muted }}>
          {filteredCount}개 표시 / 전체 {totalCount}개
        </span>
      </div>

      <Section label="정렬">
        <Chips
          items={SORT_OPTIONS}
          value={filter.sort}
          onChange={(v) => set("sort", v as LogFilter["sort"])}
        />
      </Section>

      <Section label="검색">
        <input
          value={filter.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="곡 제목"
          style={{
            width: "100%",
            padding: "6px 8px",
            background: T.bg,
            border: `1px solid ${T.line}`,
            color: T.text,
            fontSize: 12,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </Section>

      <Section label="레벨">
        <RangeWithPresets
          minValue={filter.lvMin}
          maxValue={filter.lvMax}
          onRangeChange={(min, max) =>
            onChange({ ...filter, lvMin: min, lvMax: max })
          }
          presets={LV_PRESETS[game]}
        />
      </Section>

      <Section label="달성률 (%)">
        <RangeWithPresets
          minValue={filter.achMin}
          maxValue={filter.achMax}
          onRangeChange={(min, max) =>
            onChange({ ...filter, achMin: min, achMax: max })
          }
          presets={ACH_PRESETS[game]}
          placeholder={["0", "101"]}
        />
      </Section>

      <Section label="콤보">
        <Chips
          items={COMBO_PRESETS[game]}
          value={filter.combo}
          onChange={(v) => set("combo", v)}
        />
      </Section>

      {game === "maimai" && (
        <Section label="싱크">
          <Chips
            items={SYNC_PRESETS}
            value={filter.sync}
            onChange={(v) => set("sync", v)}
          />
        </Section>
      )}

      {game === "maimai" && (
        <Section label="채보 유형">
          <Chips
            items={[
              { label: "전체", value: "ALL" },
              { label: "ST", value: "ST" },
              { label: "DX", value: "DX" },
            ]}
            value={filter.chartType}
            onChange={(v) => set("chartType", v as LogFilter["chartType"])}
          />
        </Section>
      )}

      <Section label="난이도">
        <Chips
          items={DIFF_PRESETS[game]}
          value={filter.diff}
          onChange={(v) => set("diff", v)}
        />
      </Section>
    </div>
  );
}
