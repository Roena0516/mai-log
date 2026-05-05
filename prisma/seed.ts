import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const VERSION_MAP: Record<number, string> = {
  10000: "maimai",
  11000: "maimai PLUS",
  12000: "GreeN",
  13000: "GreeN PLUS",
  14000: "ORANGE",
  15000: "ORANGE PLUS",
  16000: "PiNK",
  17000: "PiNK PLUS",
  18000: "MURASAKi",
  18500: "MURASAKi PLUS",
  19000: "MiLK",
  19500: "MiLK PLUS",
  19900: "FiNALE",
  20000: "でらっくす",
  20500: "でらっくす PLUS",
  21000: "Splash",
  21500: "Splash PLUS",
  22000: "UNiVERSE",
  22500: "UNiVERSE PLUS",
  23000: "FESTiVAL",
  23500: "FESTiVAL PLUS",
  24000: "BUDDiES",
  24500: "BUDDiES PLUS",
  25000: "PRiSM",
  25500: "PRiSM PLUS",
  26000: "CiRCLE",
  26500: "CiRCLE PLUS",
};

// 신곡 기준: PRiSM PLUS(25500) + CiRCLE(26000) + CiRCLE PLUS(26500)
// TODO: 이거 여기 말고 레이팅 계산식에 포함하는게 좋을 거 같은데
const NEW_VERSION_THRESHOLD = 25500;

const DIFF_KEYS = ["bas", "adv", "exp", "mas", "remas"] as const;
const DIFF_TYPE_MAP: Record<string, string> = {
  bas: "basic",
  adv: "advanced",
  exp: "expert",
  mas: "master",
  remas: "remaster",
};

function getVersionName(version: number): string {
  const keys = Object.keys(VERSION_MAP)
    .map(Number)
    .sort((a, b) => a - b);
  let result = VERSION_MAP[keys[0]];
  for (const key of keys) {
    if (version >= key) result = VERSION_MAP[key];
  }
  return result;
}

async function main() {
  console.log("Fetching song data...");
  const res = await fetch(
    "https://otoge-db.net/maimai/data/music-ex-intl.json",
  );
  const songs = await res.json();
  console.log(`Fetched ${songs.length} songs`);

  let songCount = 0;
  let chartCount = 0;

  for (const song of songs) {
    // UTAGE 제외
    if (song.lev_utage && !song.lev_bas && !song.dx_lev_bas) continue;

    const version = parseInt(song.version);
    const isNewVersion = version >= NEW_VERSION_THRESHOLD;

    const createdSong = await prisma.song.upsert({
      where: {
        title_artist: {
          title: song.title,
          artist: song.artist,
        },
      },
      update: {},
      create: {
        title: song.title,
        artist: song.artist,
        catcode: song.catcode,
        version,
        imageUrl: song.image_url,
      },
    });
    songCount++;

    // Standard 채보
    for (const diff of DIFF_KEYS) {
      const levelKey = `lev_${diff}`;
      const levelValueKey = `lev_${diff}_i`;
      if (!song[levelKey]) continue;

      await prisma.chart.upsert({
        where: {
          songId_isDx_difficultyType: {
            songId: createdSong.id,
            isDx: false,
            difficultyType: DIFF_TYPE_MAP[diff],
          },
        },
        update: {
          level: song[levelKey],
          levelValue: parseFloat(
            song[levelValueKey] ?? song[levelKey].replace("+", ".6"),
          ),
          isNewVersion,
        },
        create: {
          songId: createdSong.id,
          isDx: false,
          difficultyType: DIFF_TYPE_MAP[diff],
          level: song[levelKey],
          levelValue: parseFloat(
            song[levelValueKey] ?? song[levelKey].replace("+", ".6"),
          ),
          isNewVersion,
        },
      });
      chartCount++;
    }

    // DX 채보
    for (const diff of DIFF_KEYS) {
      const levelKey = `dx_lev_${diff}`;
      const levelValueKey = `dx_lev_${diff}_i`;
      if (!song[levelKey]) continue;

      await prisma.chart.upsert({
        where: {
          songId_isDx_difficultyType: {
            songId: createdSong.id,
            isDx: true,
            difficultyType: DIFF_TYPE_MAP[diff],
          },
        },
        update: {
          level: song[levelKey],
          levelValue: parseFloat(
            song[levelValueKey] ?? song[levelKey].replace("+", ".6"),
          ),
          isNewVersion,
        },
        create: {
          songId: createdSong.id,
          isDx: true,
          difficultyType: DIFF_TYPE_MAP[diff],
          level: song[levelKey],
          levelValue: parseFloat(
            song[levelValueKey] ?? song[levelKey].replace("+", ".6"),
          ),
          isNewVersion,
        },
      });
      chartCount++;
    }
  }

  console.log(`Done! Songs: ${songCount}, Charts: ${chartCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
