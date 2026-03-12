import Image from "next/image";

type ClearMarkType =
  | "SSS+"
  | "SSS"
  | "SS+"
  | "SS"
  | "S+"
  | "S"
  | "AAA"
  | "BBB"
  | "CCC"
  | "D";
type FlagType =
  | "FC"
  | "FC+"
  | "AP"
  | "AP+"
  | "FS"
  | "FS+"
  | "FSD"
  | "FSD+"
  | "SYNC";
type DifficultyType = "MASTER" | "EXPERT" | "ADVANCED" | "BASIC" | "RE:MASTER";
type SongType = "DX" | "ST";

interface SongCardProps {
  difficulty: DifficultyType;
  ratingRank: number;
  songName: string;
  achievement: string;
  ratingScore: number;
  clearMark: ClearMarkType;
  flags?: FlagType[];
  constant: string;
  bgColor?: string;
  type?: SongType;
}

// 배경색
const difficultyColors = {
  MASTER: "#CB9FF4",
  EXPERT: "#FB9F9F",
  ADVANCED: "#F4E87E",
  BASIC: "#7EEC7A",
  "RE:MASTER": "#F1E2FF",
};

// 난이도 텍스트 스타일 (fill, stroke)
const difficultyStyles = {
  MASTER: { fill: "#FFFFFF", stroke: "#934ADA", strokeWidth: "10px" },
  EXPERT: { fill: "#FFFFFF", stroke: "#E14F4F", strokeWidth: "10px" },
  ADVANCED: { fill: "#FFFFFF", stroke: "#CCA76B", strokeWidth: "10px" },
  BASIC: { fill: "#FFFFFF", stroke: "#66BB66", strokeWidth: "10px" },
  "RE:MASTER": { fill: "#D965F5", stroke: "#FFFFFF", strokeWidth: "10px" },
};

const rainbowGradient =
  "linear-gradient(98.2125deg, rgb(182, 218, 255) 1.6753%, rgb(244, 255, 120) 29.583%, rgb(255, 192, 192) 53.769%, rgb(192, 255, 137) 76.56%)";

// 랭크 스타일
function getRankStyle(rank: ClearMarkType) {
  if (rank === "SSS+")
    return { fill: "rainbow", stroke: "#AF624F", strokeWidth: "10px" };
  if (rank === "SSS")
    return { fill: "rainbow", stroke: "#524360", strokeWidth: "10px" };
  if (rank === "SS+" || rank === "SS")
    return { fill: "#FAE479", stroke: "#524360", strokeWidth: "10px" };
  if (rank === "S+" || rank === "S")
    return { fill: "#FFF4BF", stroke: "#524360", strokeWidth: "10px" };
  if (rank === "AAA")
    return { fill: "#FB9F9F", stroke: "#524360", strokeWidth: "10px" };
  if (rank === "BBB")
    return { fill: "#A1D8FF", stroke: "#524360", strokeWidth: "10px" };
  if (rank === "CCC")
    return { fill: "#D8A1FF", stroke: "#524360", strokeWidth: "10px" };
  if (rank === "D")
    return { fill: "#FFFFFF", stroke: "#524360", strokeWidth: "10px" };
  return { fill: "#FFFFFF", stroke: "#524360", strokeWidth: "10px" };
}

// FC 플래그 스타일
function getFcFlagStyle(flag: FlagType) {
  if (flag === "AP+")
    return { fill: "rainbow", stroke: "#AF624F", strokeWidth: "10px" };
  if (flag === "AP")
    return { fill: "rainbow", stroke: "#524360", strokeWidth: "10px" };
  if (flag === "FC" || flag === "FC+")
    return { fill: "#81DE77", stroke: "#3E8E43", strokeWidth: "10px" };
  return { fill: "#FFFFFF", stroke: "#000000", strokeWidth: "10px" };
}

// SYNC 플래그 스타일
function getSyncFlagStyle(flag: FlagType) {
  if (flag === "FSD+")
    return { fill: "rainbow", stroke: "#AF624F", strokeWidth: "10px" };
  if (flag === "FSD")
    return { fill: "rainbow", stroke: "#524360", strokeWidth: "10px" };
  if (flag === "FS" || flag === "FS+")
    return { fill: "#BDDFFF", stroke: "#934ADA", strokeWidth: "10px" };
  if (flag === "SYNC")
    return { fill: "#934ADA", stroke: "#BDDFFF", strokeWidth: "10px" };
  return { fill: "#FFFFFF", stroke: "#000000", strokeWidth: "10px" };
}

export default function SongCard({
  difficulty,
  ratingRank,
  songName,
  achievement,
  ratingScore,
  clearMark,
  flags = [],
  constant,
  bgColor,
  type = "DX",
}: SongCardProps) {
  const backgroundColor = bgColor || difficultyColors[difficulty];
  const typeImage =
    type === "DX" ? "/share/assets/DX.png" : "/share/assets/ST.png";

  // FC 관련 플래그 찾기
  const fcFlag = flags.find((f) => ["FC", "FC+", "AP", "AP+"].includes(f));

  // SYNC 관련 플래그 찾기
  const syncFlag = flags.find((f) =>
    ["FS", "FS+", "FSD", "FSD+", "SYNC"].includes(f),
  );

  // 스타일 가져오기
  const diffStyle = difficultyStyles[difficulty];
  const rankStyle = getRankStyle(clearMark);
  const fcFlagStyle = fcFlag ? getFcFlagStyle(fcFlag) : null;
  const syncFlagStyle = syncFlag ? getSyncFlagStyle(syncFlag) : null;

  return (
    <div
      className="border-2 border-[#2b2b2b] border-solid flex gap-4 items-start p-4 rounded-lg shadow-[0px_4px_0px_0px_rgba(0,0,0,0.6)] w-full"
      style={{ backgroundColor }}
    >
      {/* Jacket */}
      <div className="relative rounded-lg h-[174px] aspect-square shrink-0">
        <Image
          src="/share/assets/Jacket.png"
          alt={songName}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Song Detail */}
      <div className="flex flex-1 flex-col gap-3 items-start pr-1">
        {/* Top - Difficulty, Rating Rank, Type */}
        <div className="flex items-center justify-between w-full">
          {/* Difficulty */}
          <div
            className="flex flex-col justify-center leading-none text-[32px] whitespace-nowrap font-extrabold"
            style={{
              color: diffStyle.fill,
              WebkitTextStroke: `${diffStyle.strokeWidth} ${diffStyle.stroke}`,
              paintOrder: "stroke fill",
              textShadow: "0px 3px 0px rgba(0,0,0,0.6)",
            }}
          >
            <p className="leading-normal">{difficulty}</p>
          </div>
          <div className="flex gap-4 items-center justify-end">
            {/* Rating Rank */}
            <div
              className="flex flex-col justify-center leading-none text-[24px] whitespace-nowrap font-medium"
              style={{
                color: "#C9E5FF",
                WebkitTextStroke: "5px #4C6276",
                paintOrder: "stroke fill",
                textShadow: "0px 3px 0px rgba(0,0,0,0.6)",
              }}
            >
              <p className="leading-normal">RATING #{ratingRank}</p>
            </div>
            <div className="h-[38px] relative w-[134px]">
              <Image src={typeImage} alt={type} fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* Song Name */}
        <div className="bg-[#4d4d4d] flex h-[60px] items-center overflow-hidden px-4 rounded-xl w-full">
          <div className="flex flex-col justify-center leading-none text-[28px] text-white whitespace-nowrap font-normal">
            <p className="leading-normal">{songName}</p>
          </div>
        </div>

        {/* Log - Achievement, Rating Score, Clear Marks */}
        <div className="flex h-[42px] items-center justify-between w-full">
          {/* Score Section */}
          <div className="flex gap-3 items-center">
            {/* Achievement */}
            <div className="bg-white flex h-[42px] items-center overflow-hidden px-3 rounded-xl w-[250px]">
              <div className="flex flex-col justify-center leading-none text-[24px] text-[#2b2b2b] whitespace-nowrap font-normal">
                <p className="leading-normal">{achievement}</p>
              </div>
            </div>

            {/* Rating Score */}
            <div className="bg-white flex h-[42px] items-center justify-center overflow-hidden px-3 rounded-xl w-[150px]">
              <div className="flex flex-col justify-center leading-none text-[24px] text-[#2b2b2b] whitespace-nowrap font-normal">
                <p className="leading-normal">{ratingScore}</p>
              </div>
            </div>
          </div>

          {/* Clear Mark Section - 3 Slots */}
          <div className="flex gap-4 items-center font-extrabold leading-none text-[32px] text-center whitespace-nowrap pr-[10px]">
            {/* Slot 1: Rank */}
            <div className="w-[90px]">
              {rankStyle.fill === "rainbow" ? (
                <div className="relative">
                  {/* Stroke 레이어 */}
                  <div
                    className="flex flex-col justify-center"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: `${rankStyle.strokeWidth} ${rankStyle.stroke}`,
                      textShadow: "0px 0px 0px rgba(0,0,0,0.6)",
                    }}
                  >
                    <p className="leading-normal">{clearMark}</p>
                  </div>
                  {/* Fill 레이어 (그라디언트) */}
                  <div
                    className="absolute top-0 left-0 flex flex-col justify-center bg-clip-text w-full"
                    style={{
                      backgroundImage: rainbowGradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    <p className="leading-normal">{clearMark}</p>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col justify-center"
                  style={{
                    color: rankStyle.fill,
                    WebkitTextStroke: `${rankStyle.strokeWidth} ${rankStyle.stroke}`,
                    paintOrder: "stroke fill",
                    textShadow: "0px 0px 0px rgba(0,0,0,0.6)",
                  }}
                >
                  <p className="leading-normal">{clearMark}</p>
                </div>
              )}
            </div>

            {/* Slot 2: FC Related */}
            <div className="w-[90px]">
              {fcFlag && fcFlagStyle && (
                <>
                  {fcFlagStyle.fill === "rainbow" ? (
                    <div className="relative">
                      {/* Stroke 레이어 */}
                      <div
                        className="flex flex-col justify-center"
                        style={{
                          color: "transparent",
                          WebkitTextStroke: `${fcFlagStyle.strokeWidth} ${fcFlagStyle.stroke}`,
                          textShadow: "0px 0px 0px rgba(0,0,0,0.6)",
                        }}
                      >
                        <p className="leading-normal">{fcFlag}</p>
                      </div>
                      {/* Fill 레이어 (그라디언트) */}
                      <div
                        className="absolute top-0 left-0 flex flex-col justify-center bg-clip-text w-full"
                        style={{
                          backgroundImage: rainbowGradient,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        <p className="leading-normal">{fcFlag}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col justify-center"
                      style={{
                        color: fcFlagStyle.fill,
                        WebkitTextStroke: `${fcFlagStyle.strokeWidth} ${fcFlagStyle.stroke}`,
                        paintOrder: "stroke fill",
                        textShadow: "0px 0px 0px rgba(0,0,0,0.6)",
                      }}
                    >
                      <p className="leading-normal">{fcFlag}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Slot 3: SYNC Related */}
            <div className="w-[90px]">
              {syncFlag && syncFlagStyle && (
                <>
                  {syncFlagStyle.fill === "rainbow" ? (
                    <div className="relative">
                      {/* Stroke 레이어 */}
                      <div
                        className="flex flex-col justify-center"
                        style={{
                          color: "transparent",
                          WebkitTextStroke: `${syncFlagStyle.strokeWidth} ${syncFlagStyle.stroke}`,
                          textShadow: "0px 0px 0px rgba(0,0,0,0.6)",
                        }}
                      >
                        <p className="leading-normal">{syncFlag}</p>
                      </div>
                      {/* Fill 레이어 (그라디언트) */}
                      <div
                        className="absolute top-0 left-0 flex flex-col justify-center bg-clip-text w-full"
                        style={{
                          backgroundImage: rainbowGradient,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        <p className="leading-normal">{syncFlag}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col justify-center"
                      style={{
                        color: syncFlagStyle.fill,
                        WebkitTextStroke: `${syncFlagStyle.strokeWidth} ${syncFlagStyle.stroke}`,
                        paintOrder: "stroke fill",
                        textShadow: "0px 0px 0px rgba(0,0,0,0.6)",
                      }}
                    >
                      <p className="leading-normal">{syncFlag}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Level Constant */}
      <div className="border-[rgba(43,43,43,0.4)] border-dashed border-l-8 flex flex-col items-center justify-between pl-5 self-stretch w-[150px] shrink-0">
        <div className="flex flex-1 items-center justify-center rounded-lg w-full">
          <div
            className="flex flex-col justify-center leading-none text-[56px] text-center whitespace-nowrap font-extrabold"
            style={{
              color: diffStyle.fill,
              WebkitTextStroke: `${diffStyle.strokeWidth} ${diffStyle.stroke}`,
              paintOrder: "stroke fill",
              textShadow: "0px 3px 0px rgba(0,0,0,0.6)",
            }}
          >
            <p className="leading-normal">{constant}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
