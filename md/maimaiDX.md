# maimai DX 레이팅 계산 로직

## 개요

maimai DX의 레이팅 산출 방식을 정리한 문서.
타 게임 환산의 기준값으로 사용된다.

---

## 레이팅 공식

```
단일 레이팅 = floor(보면정수 × min(achievement, 1005000) / 1000000 × 랭크별 계수) + AP 보너스
최종 레이팅 = 구곡 상위 35곡 + 신곡 상위 15곡 합산
```

> 신곡 기준: 현행 버전 + 이전 버전 (채보 DB의 버전 정보로 판단)

---

## 랭크 기준

| achievement | 랭크 |
| :---------: | :--: |
|  1,010,000  | SSS+ |
| 1,005,000 ~ | SSS+ |
| 1,000,000 ~ | SSS  |
|  995,000 ~  | SS+  |
|  990,000 ~  |  SS  |
|  980,000 ~  |  S+  |
|  970,000 ~  |  S   |
|  940,000 ~  | AAA  |
|  900,000 ~  |  AA  |
|  800,000 ~  |  A   |
|  750,000 ~  | BBB  |
|  700,000 ~  |  BB  |
|  600,000 ~  |  B   |
|  500,000 ~  |  C   |
|  ~ 499,999  |  D   |

```typescript
function getRank(achievement: number): string {
  if (achievement >= 1005000) return "SSS+";
  if (achievement >= 1000000) return "SSS";
  if (achievement >= 995000) return "SS+";
  if (achievement >= 990000) return "SS";
  if (achievement >= 980000) return "S+";
  if (achievement >= 970000) return "S";
  if (achievement >= 940000) return "AAA";
  if (achievement >= 900000) return "AA";
  if (achievement >= 800000) return "A";
  if (achievement >= 750000) return "BBB";
  if (achievement >= 700000) return "BB";
  if (achievement >= 600000) return "B";
  if (achievement >= 500000) return "C";
  return "D";
}
```

---

## 랭크별 계수

S(970,000) 미만은 계수가 공개되어 있지 않으며, 레이팅 기여도가 낮아 사실상 0으로 처리.

|   랭크   | 계수 |
| :------: | :--: |
|   SSS+   | 22.4 |
|   SSS    | 21.6 |
|   SS+    | 21.1 |
|    SS    | 20.8 |
|    S+    | 20.3 |
|    S     | 20.0 |
| ~ S 미만 |  0   |

```typescript
const RANK_COEFFICIENT: Record<string, number> = {
  "SSS+": 22.4,
  SSS: 21.6,
  "SS+": 21.1,
  SS: 20.8,
  "S+": 20.3,
  S: 20.0,
};

function getCoefficient(achievement: number): number {
  const rank = getRank(achievement);
  return RANK_COEFFICIENT[rank] ?? 0;
}
```

---

## AP 보너스

maimai DX CiRCLE 버전부터 AP(All Perfect) 달성 시 단일 레이팅에 +1 추가.

```typescript
const apBonus = clearMark === "ap" || clearMark === "app" ? 1 : 0;
```

---

## 최종 계산 함수

```typescript
function calcSingleRating(
  level: number,
  achievement: number, // 0 ~ 1,010,000
  clearMark: string,
): number {
  const coefficient = getCoefficient(achievement);
  if (coefficient === 0) return 0;

  const apBonus = clearMark === "ap" || clearMark === "app" ? 1 : 0;
  const cappedAchievement = Math.min(achievement, 1005000);

  return (
    Math.floor(((level * cappedAchievement) / 1000000) * coefficient) + apBonus
  );
}

function calcTotalRating(
  records: (Record & { isNewVersion: boolean })[],
): number {
  const rated = records.map((r) => ({
    rating: calcSingleRating(r.level, r.achievement, r.clearMark),
    isNewVersion: r.isNewVersion,
  }));

  // 신곡: 현행 버전 + 이전 버전 상위 15곡
  const newSongs = rated
    .filter((r) => r.isNewVersion)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 15);

  // 구곡: 그 외 상위 35곡
  const oldSongs = rated
    .filter((r) => !r.isNewVersion)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 35);

  return [...newSongs, ...oldSongs].reduce((sum, r) => sum + r.rating, 0);
}
```

---

## 계산 예시

|  곡  | 레벨 |  달성률   | 클리어 | 계수 | AP보너스 |                단일 레이팅                 |
| :--: | :--: | :-------: | :----: | :--: | :------: | :----------------------------------------: |
| 곡 A | 15.0 | 1,010,000 |  app   | 22.4 |    +1    | `floor(15.0 × 1.005 × 22.4) + 1` = **338** |
| 곡 B | 13.9 | 1,000,000 |   fc   | 21.6 |    +0    |   `floor(13.9 × 1.000 × 21.6)` = **300**   |
| 곡 C | 12.0 |  990,000  | clear  | 20.8 |    +0    |   `floor(12.0 × 0.990 × 20.8)` = **246**   |
| 곡 D | 10.0 |  960,000  | clear  |  0   |    +0    |                   **0**                    |

---

## 레이팅 티어

|      색상      |   레이팅 범위   |
| :------------: | :-------------: |
|      하양      |     0 ~ 999     |
|      파랑      |  1,000 ~ 1,999  |
|      초록      |  2,000 ~ 3,999  |
|      노랑      |  4,000 ~ 6,999  |
|      빨강      |  7,000 ~ 9,999  |
|      보라      | 10,000 ~ 11,999 |
|       동       | 12,000 ~ 12,999 |
|       은       | 13,000 ~ 13,999 |
|      금 ★      | 14,000 ~ 14,249 |
|     금 ★★      | 14,250 ~ 14,499 |
|     백금 ★     | 14,500 ~ 14,749 |
|    백금 ★★     | 14,750 ~ 14,999 |
|    무지개 ★    | 15,000 ~ 15,249 |
|   무지개 ★★    | 15,250 ~ 15,499 |
|   무지개 ★★★   | 15,500 ~ 15,749 |
|  무지개 ★★★★   | 15,750 ~ 15,999 |
|  무지개·극 ★   | 16,000 ~ 16,249 |
|  무지개·극 ★★  | 16,250 ~ 16,499 |
| 무지개·극 ★★★  | 16,500 ~ 16,749 |
| 무지개·극 ★★★★ |    16,750 ~     |

```typescript
type MaimaiTier = { name: string; min: number; max: number | null };

const MAIMAI_TIERS: MaimaiTier[] = [
  { name: "하양", min: 0, max: 999 },
  { name: "파랑", min: 1000, max: 1999 },
  { name: "초록", min: 2000, max: 3999 },
  { name: "노랑", min: 4000, max: 6999 },
  { name: "빨강", min: 7000, max: 9999 },
  { name: "보라", min: 10000, max: 11999 },
  { name: "동", min: 12000, max: 12999 },
  { name: "은", min: 13000, max: 13999 },
  { name: "금 ★", min: 14000, max: 14249 },
  { name: "금 ★★", min: 14250, max: 14499 },
  { name: "백금 ★", min: 14500, max: 14749 },
  { name: "백금 ★★", min: 14750, max: 14999 },
  { name: "무지개 ★", min: 15000, max: 15249 },
  { name: "무지개 ★★", min: 15250, max: 15499 },
  { name: "무지개 ★★★", min: 15500, max: 15749 },
  { name: "무지개 ★★★★", min: 15750, max: 15999 },
  { name: "무지개·극 ★", min: 16000, max: 16249 },
  { name: "무지개·극 ★★", min: 16250, max: 16499 },
  { name: "무지개·극 ★★★", min: 16500, max: 16749 },
  { name: "무지개·극 ★★★★", min: 16750, max: null },
];

function getMaimaiTier(rating: number): MaimaiTier {
  return MAIMAI_TIERS.findLast((t) => rating >= t.min) ?? MAIMAI_TIERS[0];
}
```

---

## 주의사항

- S(970,000) 미만 채보는 레이팅 기여도 없음 (계수 0)
- AP 보너스는 maimai DX CiRCLE 버전 이후에만 적용
- 신곡 여부는 채보 DB의 버전 정보로 판단 (현행 버전 + 이전 버전 = 신곡)
