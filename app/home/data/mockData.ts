// 프로필 데이터
export const profileData = {
  title: "FULL SYNCｷﾎﾞﾝﾇ",
  nickname: "ＲＯＥＮＡ・∀・",
  rating: [1, 5, 9, 7, 5], // 각 자리수
  starCount: 309,
  playCount: 1726,
  currentPlayCount: 153,
};

// 곡 데이터 타입
export type SongData = {
  difficulty: "MASTER" | "EXPERT" | "ADVANCED" | "BASIC" | "RE:MASTER";
  ratingRank: number;
  songName: string;
  achievement: string;
  ratingScore: number;
  clearMark: "SSS+" | "SSS" | "SS+" | "SS" | "S+" | "S" | "AAA" | "BBB" | "CCC" | "D";
  flags?: ("FC" | "FC+" | "AP" | "AP+" | "FS" | "FS+" | "FSD" | "FSD+" | "SYNC")[];
  constant: string;
  bgColor?: string;
  type?: "DX" | "ST";
};

// 레이팅 페이지 곡 리스트
export const ratingSongs: SongData[] = [
  {
    difficulty: "RE:MASTER",
    ratingRank: 0,
    songName: "Xaleid◆scopiX",
    achievement: "101.0000%",
    ratingScore: 338,
    clearMark: "SSS+",
    flags: ["AP+", "FSD+"],
    constant: "15.0",
  },
  {
    difficulty: "MASTER",
    ratingRank: 1,
    songName: "ATLAS RUSH",
    achievement: "100.5499%",
    ratingScore: 330,
    clearMark: "SSS+",
    flags: ["FC", "SYNC"],
    constant: "14.7",
  },
  {
    difficulty: "MASTER",
    ratingRank: 2,
    songName: "雨露霜雪",
    achievement: "100.5393%",
    ratingScore: 330,
    clearMark: "SSS+",
    flags: ["FS"],
    constant: "14.7",
  },
  {
    difficulty: "MASTER",
    ratingRank: 3,
    songName: "Break The Speakers",
    achievement: "100.5370%",
    ratingScore: 330,
    clearMark: "SSS+",
    flags: ["FC"],
    constant: "14.7",
  },
  {
    difficulty: "MASTER",
    ratingRank: 4,
    songName: "MYTH Re：LEASE",
    achievement: "100.5670%",
    ratingScore: 326,
    clearMark: "SSS+",
    flags: ["SYNC"],
    constant: "14.5",
  },
  {
    difficulty: "MASTER",
    ratingRank: 5,
    songName: "Retribution ～ Cycle of Redemption ～",
    achievement: "100.6950%",
    ratingScore: 324,
    clearMark: "SSS+",
    flags: ["FC"],
    constant: "14.4",
  },
  {
    difficulty: "MASTER",
    ratingRank: 6,
    songName: "Re：End of a Dream",
    achievement: "100.6466%",
    ratingScore: 324,
    clearMark: "SSS+",
    flags: ["FC", "SYNC"],
    constant: "14.4",
  },
  {
    difficulty: "MASTER",
    ratingRank: 7,
    songName: "Zitronectar",
    achievement: "100.5742%",
    ratingScore: 321,
    clearMark: "SSS+",
    flags: ["FC"],
    constant: "14.3",
  },
  {
    difficulty: "MASTER",
    ratingRank: 8,
    songName: "FLΛME/FRΦST",
    achievement: "100.5499%",
    ratingScore: 319,
    clearMark: "SSS",
    flags: ["SYNC"],
    constant: "14.8",
  },
  {
    difficulty: "EXPERT",
    ratingRank: 9,
    songName: "偉大なる悪魔は実は大天使パトラちゃん様なのだ！",
    achievement: "100.9629%",
    ratingScore: 500,
    clearMark: "SSS",
    flags: ["AP"],
    constant: "10.3",
  },
  {
    difficulty: "ADVANCED",
    ratingRank: 10,
    songName: "ロストワンの号哭",
    achievement: "98.6192%",
    ratingScore: 500,
    clearMark: "S",
    flags: ["FC", "SYNC"],
    constant: "8.0",
    bgColor: "#f4cf86",
    type: "ST",
  },
  {
    difficulty: "BASIC",
    ratingRank: 11,
    songName: "きゅうくらりん",
    achievement: "98.3364%",
    ratingScore: 500,
    clearMark: "S",
    flags: ["FC", "FS+"],
    constant: "4.0",
    bgColor: "#a8e6a3",
  },
];
