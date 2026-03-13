"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type DifficultyType =
  | "ALL"
  | "BASIC"
  | "ADVANCED"
  | "EXPERT"
  | "MASTER"
  | "RE:MASTER";
type LevelType =
  | "ALL"
  | "11"
  | "11+"
  | "12"
  | "12+"
  | "13"
  | "13+"
  | "14"
  | "14+"
  | "15";
type SortType = "레이팅 점수" | "제목" | "레벨";

const difficulties: DifficultyType[] = [
  "ALL",
  "BASIC",
  "ADVANCED",
  "EXPERT",
  "MASTER",
  "RE:MASTER",
];
const levels: LevelType[] = [
  "ALL",
  "11",
  "11+",
  "12",
  "12+",
  "13",
  "13+",
  "14",
  "14+",
  "15",
];

// 레벨 버튼에 대한 범위 매핑
const levelRanges: Record<
  Exclude<LevelType, "ALL">,
  { min: number; max: number }
> = {
  "11": { min: 11.0, max: 11.5 },
  "11+": { min: 11.6, max: 11.9 },
  "12": { min: 12.0, max: 12.5 },
  "12+": { min: 12.6, max: 12.9 },
  "13": { min: 13.0, max: 13.5 },
  "13+": { min: 13.6, max: 13.9 },
  "14": { min: 14.0, max: 14.5 },
  "14+": { min: 14.6, max: 14.9 },
  "15": { min: 15.0, max: 15.0 },
};

export default function FilterPanel() {
  const [sortType, setSortType] = useState<SortType>("레이팅 점수");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    Set<DifficultyType>
  >(new Set(["ALL"]));
  const [selectedLevels, setSelectedLevels] = useState<Set<LevelType>>(
    new Set(["ALL"]),
  );
  const [minLevel, setMinLevel] = useState("1.0");
  const [maxLevel, setMaxLevel] = useState("15.0");
  const [difficultyClickStart, setDifficultyClickStart] =
    useState<DifficultyType | null>(null);
  const [levelClickStart, setLevelClickStart] = useState<LevelType | null>(
    null,
  );

  // 레벨 입력값 변경 시 버튼 동기화
  useEffect(() => {
    const min = parseFloat(minLevel);
    const max = parseFloat(maxLevel);

    if (isNaN(min) || isNaN(max)) return;

    const newSelectedLevels = new Set<LevelType>();

    // 각 레벨 버튼이 입력 범위에 완전히 포함되는지 확인
    (Object.keys(levelRanges) as Exclude<LevelType, "ALL">[]).forEach(
      (level) => {
        const range = levelRanges[level];
        if (range.min >= min && range.max <= max) {
          newSelectedLevels.add(level);
        }
      },
    );

    if (newSelectedLevels.size === 0) {
      newSelectedLevels.add("ALL");
    }

    setSelectedLevels(newSelectedLevels);
  }, [minLevel, maxLevel]);

  const handleDifficultyClick = (difficulty: DifficultyType) => {
    if (difficulty === "ALL") {
      setSelectedDifficulties(new Set(["ALL"]));
      setDifficultyClickStart(null);
      return;
    }

    if (!difficultyClickStart || difficultyClickStart === difficulty) {
      // 첫 번째 클릭 또는 같은 버튼 클릭
      const newSelected = new Set<DifficultyType>([difficulty]);
      setSelectedDifficulties(newSelected);
      setDifficultyClickStart(difficulty);
    } else {
      // 범위 선택
      const startIndex = difficulties.indexOf(difficultyClickStart);
      const endIndex = difficulties.indexOf(difficulty);
      const [min, max] =
        startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

      const newSelected = new Set<DifficultyType>();
      for (let i = min; i <= max; i++) {
        if (difficulties[i] !== "ALL") {
          newSelected.add(difficulties[i]);
        }
      }

      setSelectedDifficulties(newSelected);
      setDifficultyClickStart(null);
    }
  };

  const handleLevelClick = (level: LevelType) => {
    if (level === "ALL") {
      setSelectedLevels(new Set(["ALL"]));
      setMinLevel("1.0");
      setMaxLevel("15.0");
      setLevelClickStart(null);
      return;
    }

    if (!levelClickStart || levelClickStart === level) {
      // 첫 번째 클릭 또는 같은 버튼 클릭
      const newSelected = new Set<LevelType>([level]);
      setSelectedLevels(newSelected);
      setLevelClickStart(level);

      // 입력값 업데이트
      const range = levelRanges[level];
      setMinLevel(range.min.toFixed(1));
      setMaxLevel(range.max.toFixed(1));
    } else {
      // 범위 선택
      const startIndex = levels.indexOf(levelClickStart);
      const endIndex = levels.indexOf(level);
      const [minIdx, maxIdx] =
        startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

      const newSelected = new Set<LevelType>();
      let minVal = Infinity;
      let maxVal = -Infinity;

      for (let i = minIdx; i <= maxIdx; i++) {
        if (levels[i] !== "ALL") {
          const lvl = levels[i] as Exclude<LevelType, "ALL">;
          newSelected.add(lvl);
          const range = levelRanges[lvl];
          minVal = Math.min(minVal, range.min);
          maxVal = Math.max(maxVal, range.max);
        }
      }

      setSelectedLevels(newSelected);
      setMinLevel(minVal.toFixed(1));
      setMaxLevel(maxVal.toFixed(1));
      setLevelClickStart(null);
    }
  };

  return (
    <div className="bg-white border-2 border-[#2b2b2b] border-solid flex flex-col gap-4 overflow-hidden p-6 rounded-lg shadow-[4px_8px_0px_0px_rgba(0,0,0,0.4)] w-full">
      {/* 좌우 2열 레이아웃 */}
      <div className="flex gap-6">
        {/* 왼쪽: 정렬 섹션 */}
        <div className="flex flex-col gap-[12px] flex-1">
          {/* 정렬 제목 & 드롭다운 */}
          <div className="flex flex-col gap-[6px]">
            {/* 정렬 레이블 */}
            <div className="flex flex-col justify-center leading-none text-[26px] text-[#2b2b2b] whitespace-nowrap font-medium">
              <p className="leading-normal">정렬</p>
            </div>

            {/* 정렬 드롭다운 & 버튼 */}
            <div className="flex gap-2 items-center">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="bg-white border-2 border-[#BFBFBF] border-solid h-[54px] overflow-hidden px-4 pr-10 rounded-lg text-[24px] text-[#2b2b2b] outline-none appearance-none cursor-pointer flex-1"
              >
                <option value="레이팅 점수">레이팅 점수</option>
                <option value="제목">제목</option>
                <option value="레벨">레벨</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="bg-white border-2 border-[#BFBFBF] border-solid flex h-[54px] w-[68px] items-center justify-center rounded-full hover:border-[#2b2b2b] cursor-pointer transition-colors"
              >
                <div className="relative w-8 h-8">
                  <Image
                    src={
                      sortOrder === "desc"
                        ? "/share/assets/icons/SortDown.svg"
                        : "/share/assets/icons/SortUp.svg"
                    }
                    alt={sortOrder === "desc" ? "내림차순" : "오름차순"}
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* 난이도 버튼들 */}
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyClick(diff)}
                className={`border border-solid flex h-[48px] items-center justify-center overflow-hidden px-5 rounded-full transition-colors ${
                  selectedDifficulties.has(diff)
                    ? "bg-[#BFBFBF] border-[#2b2b2b]"
                    : "bg-white border-[#BFBFBF] hover:border-[#2b2b2b]"
                }`}
              >
                <div className="flex flex-col justify-center leading-none text-[24px] text-[#2b2b2b] whitespace-nowrap font-normal cursor-pointer">
                  <p className="leading-normal">{diff}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽: 레벨 섹션 */}
        <div className="flex flex-col gap-[12px] flex-1">
          {/* 레벨 제목 & 입력 */}
          <div className="flex flex-col gap-[6px]">
            {/* 레벨 레이블 */}
            <div className="flex flex-col justify-center leading-none text-[26px] text-[#2b2b2b] whitespace-nowrap font-medium">
              <p className="leading-normal">레벨</p>
            </div>

            {/* 레벨 입력 */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={minLevel}
                onChange={(e) => setMinLevel(e.target.value)}
                step="0.1"
                min="1"
                max="15"
                className="bg-white border-2 border-[#BFBFBF] border-solid h-[54px] overflow-hidden px-4 rounded-lg text-[24px] text-[#2b2b2b] text-left outline-none focus:border-[#2b2b2b] flex-1"
              />
              <div className="flex flex-col justify-center leading-none text-[30px] text-[#666] whitespace-nowrap font-normal">
                <p className="leading-normal">~</p>
              </div>
              <input
                type="number"
                value={maxLevel}
                onChange={(e) => setMaxLevel(e.target.value)}
                step="0.1"
                min="1"
                max="15"
                className="bg-white border-2 border-[#BFBFBF] border-solid h-[54px] overflow-hidden px-4 rounded-lg text-[24px] text-[#2b2b2b] text-left outline-none focus:border-[#2b2b2b] flex-1"
              />
            </div>
          </div>

          {/* 레벨 버튼들 */}
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelClick(level)}
                className={`border border-solid flex h-[48px] items-center justify-center overflow-hidden px-5 rounded-full transition-colors min-w-[64px] ${
                  selectedLevels.has(level)
                    ? "bg-[#BFBFBF] border-[#2b2b2b]"
                    : "bg-white border-[#BFBFBF] hover:border-[#2b2b2b]"
                }`}
              >
                <div className="flex flex-col justify-center leading-none text-[24px] text-[#2b2b2b] whitespace-nowrap font-normal cursor-pointer">
                  <p className="leading-normal">{level}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 펼치기 버튼 */}
      <div className="flex justify-center pt-2">
        <button className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
          <div className="relative w-5 h-5">
            <Image
              src="/share/assets/icons/Arrow.svg"
              alt="펼치기"
              fill
              className="object-contain"
            />
          </div>
        </button>
      </div>
    </div>
  );
}
