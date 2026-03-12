import ProfileCard from "../components/ProfileCard";
import Navigation from "../components/Navigation";
import SongCard from "../components/SongCard";

export default function RatingPage() {
  const songs = [
    {
      difficulty: "RE:MASTER" as const,
      ratingRank: 0,
      songName: "Xaleid◆scopiX",
      achievement: "101.0000%",
      ratingScore: 338,
      clearMark: "SSS+" as const,
      flags: ["AP+" as const, "FSD+" as const],
      constant: "15.0",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 1,
      songName: "ATLAS RUSH",
      achievement: "100.5499%",
      ratingScore: 330,
      clearMark: "SSS+" as const,
      flags: ["FC" as const, "SYNC" as const],
      constant: "14.7",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 2,
      songName: "雨露霜雪",
      achievement: "100.5393%",
      ratingScore: 330,
      clearMark: "SSS+" as const,
      flags: ["FS" as const],
      constant: "14.7",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 3,
      songName: "Break The Speakers",
      achievement: "100.5370%",
      ratingScore: 330,
      clearMark: "SSS+" as const,
      flags: ["FC" as const],
      constant: "14.7",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 4,
      songName: "MYTH Re：LEASE",
      achievement: "100.5670%",
      ratingScore: 326,
      clearMark: "SSS+" as const,
      flags: ["SYNC" as const],
      constant: "14.5",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 5,
      songName: "Retribution ～ Cycle of Redemption ～",
      achievement: "100.6950%",
      ratingScore: 324,
      clearMark: "SSS+" as const,
      flags: ["FC" as const],
      constant: "14.4",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 6,
      songName: "Re：End of a Dream",
      achievement: "100.6466%",
      ratingScore: 324,
      clearMark: "SSS+" as const,
      flags: ["FC" as const, "SYNC" as const],
      constant: "14.4",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 7,
      songName: "Zitronectar",
      achievement: "100.5742%",
      ratingScore: 321,
      clearMark: "SSS+" as const,
      flags: ["FC" as const],
      constant: "14.3",
    },
    {
      difficulty: "MASTER" as const,
      ratingRank: 8,
      songName: "FLΛME/FRΦST",
      achievement: "100.5499%",
      ratingScore: 319,
      clearMark: "SSS" as const,
      flags: ["SYNC" as const],
      constant: "14.8",
    },
    {
      difficulty: "EXPERT" as const,
      ratingRank: 9,
      songName: "偉大なる悪魔は実は大天使パトラちゃん様なのだ！",
      achievement: "100.9629%",
      ratingScore: 500,
      clearMark: "SSS" as const,
      flags: ["AP" as const],
      constant: "10.3",
    },
    {
      difficulty: "ADVANCED" as const,
      ratingRank: 10,
      songName: "ロストワンの号哭",
      achievement: "98.6192%",
      ratingScore: 500,
      clearMark: "S" as const,
      flags: ["FC" as const, "SYNC" as const],
      constant: "8.0",
      bgColor: "#f4cf86",
      type: "ST",
    },
    {
      difficulty: "BASIC" as const,
      ratingRank: 11,
      songName: "きゅうくらりん",
      achievement: "98.3364%",
      ratingScore: 500,
      clearMark: "S" as const,
      flags: ["FC" as const, "FS+" as const],
      constant: "4.0",
      bgColor: "#a8e6a3",
    },
  ];

  return (
    <div className="bg-[#9bd5fc] flex flex-col items-center min-h-screen relative w-full">
      {/* Header */}
      <div className="absolute bg-white border-2 border-[#ababab] border-solid h-[110px] left-1/2 top-0 -translate-x-1/2 w-[2560px]" />

      {/* Profile Section */}
      <div className="flex h-[530px] items-center justify-center pb-6 pt-[134px] relative shrink-0 z-10">
        <ProfileCard />
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center relative shrink-0 z-10">
        <Navigation />
      </div>

      {/* Rating List */}
      <div className="flex flex-col gap-[30px] items-center overflow-hidden py-9 relative shrink-0 w-[1258px] z-10">
        {/* Title Panel */}
        <div className="bg-white flex h-[80px] items-center justify-center overflow-hidden rounded-lg shadow-[4px_8px_0px_0px_rgba(0,0,0,0.4)] w-[300px]">
          <div className="flex flex-col justify-center leading-none text-[30px] text-[#2b2b2b] whitespace-nowrap font-normal">
            <p className="leading-normal">레이팅 대상곡</p>
          </div>
        </div>

        {/* Song List */}
        <div className="flex flex-col gap-5 items-start w-full">
          {songs.map((song, index) => (
            <SongCard key={index} {...song} />
          ))}
        </div>
      </div>
    </div>
  );
}
