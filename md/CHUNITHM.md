# 츄니즘(CHUNITHM) 레이팅 변환 로직

## 개요

maimai DX 플레이 데이터(달성률, 레벨)를 기반으로
츄니즘 레이팅을 계산하는 환산 로직.

---

## 츄니즘 레이팅 원본 공식

```
단일 레이팅 = 보면정수 + 보정값
최종 레이팅 = (현행 버전 상위 20곡 + 그 외 상위 30곡) 합산 / 50  (평균)
```

### 점수 구간별 보정값

| 랭크 | 점수 하한 | 레이팅 (하한 기준) |     증가율     |
| :--: | :-------: | :----------------: | :------------: |
| SSS+ | 1,009,000 |  보면정수 + 2.15   |  없음 (고정)   |
| SSS  | 1,007,500 |  보면정수 + 2.00   | 100점 당 +0.01 |
| SS+  | 1,005,000 |  보면정수 + 1.50   | 50점 당 +0.01  |
|  SS  | 1,000,000 |  보면정수 + 1.00   | 100점 당 +0.01 |
|  S+  |  990,000  |  보면정수 + 0.60   | 250점 당 +0.01 |
|  S   |  975,000  |  보면정수 + 0.00   | 250점 당 +0.01 |
| AAA  |  950,000  |  보면정수 - 1.67   | 150점 당 +0.01 |
|  AA  |  925,000  |  보면정수 - 3.34   | 150점 당 +0.01 |
|  A   |  900,000  |  보면정수 - 5.00   |       -        |

---

## maimai → 츄니즘 변환

### 1. 보면정수 (레벨)

maimai 레벨에 +0.7을 더해 츄니즘 보면정수로 환산.

```typescript
const chuniLevel = level + 0.7;

// 15.0 → 15.7
// 13.9 → 14.6
// 10.0 → 10.7
//  1.0 →  1.7
```

### 2. 점수

maimai achievement(0 ~ 1,010,000)를 츄니즘 점수로 그대로 사용.
두 게임 모두 최대 점수 기준이 동일하므로 변환 불필요.

```typescript
const chuniScore = achievement;

// 1,010,000 (101.0000%) → 1,010,000 → SSS+ 판정
// 1,009,000 (100.9000%) → 1,009,000 → SSS+ 기준점
// 1,000,000 (100.0000%) → 1,000,000 → SS  기준점
//   975,000 ( 97.5000%) →   975,000 → S   기준점
```

### 3. 보정값 계산

```typescript
function getChunithmBonus(score: number): number {
  if (score >= 1009000) return 2.15;
  if (score >= 1007500) return 2.0 + Math.floor((score - 1007500) / 100) * 0.01;
  if (score >= 1005000) return 1.5 + Math.floor((score - 1005000) / 50) * 0.01;
  if (score >= 1000000) return 1.0 + Math.floor((score - 1000000) / 100) * 0.01;
  if (score >= 990000) return 0.6 + Math.floor((score - 990000) / 250) * 0.01;
  if (score >= 975000) return 0.0 + Math.floor((score - 975000) / 250) * 0.01;
  if (score >= 950000) return -1.67 + Math.floor((score - 950000) / 150) * 0.01;
  if (score >= 925000) return -3.34 + Math.floor((score - 925000) / 150) * 0.01;
  return -5.0;
}
```

---

## 최종 변환 함수

```typescript
function calcChunithmRating(
  level: number,
  achievement: number, // 0 ~ 1,010,000
): number {
  const chuniLevel = level + 0.7;
  const bonus = getChunithmBonus(achievement);
  return Math.max(0, chuniLevel + bonus);
}

function calcTotalChunithmRating(
  records: (Record & { isCurrentVersion: boolean })[],
): number {
  const rated = records.map((r) => ({
    rating: calcChunithmRating(r.level, r.achievement),
    isCurrentVersion: r.isCurrentVersion,
  }));

  // 채보 DB의 버전 정보로 현행 버전 여부 판단
  const current = rated
    .filter((r) => r.isCurrentVersion)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20);

  const others = rated
    .filter((r) => !r.isCurrentVersion)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 30);

  const all = [...current, ...others];
  const sum = all.reduce((acc, r) => acc + r.rating, 0);
  return Math.floor((sum / 50) * 100) / 100;
}
```

---

## 계산 예시

|  곡  | 레벨 | 보면정수 |      달성률      | 보정값 | 단일 레이팅 |
| :--: | :--: | :------: | :--------------: | :----: | :---------: |
| 곡 A | 15.0 |   15.7   | 1,010,000 (SSS+) | +2.15  |  **17.85**  |
| 곡 B | 13.9 |   14.6   |  1,000,000 (SS)  | +1.00  |  **15.60**  |
| 곡 C | 12.0 |   12.7   |   975,000 (S)    | +0.00  |  **12.70**  |
| 곡 D | 10.0 |   10.7   |  950,000 (AAA)   | -1.67  |  **9.03**   |

---

## 티어 기준

|     색상      |   수치 범위   |
| :-----------: | :-----------: |
|     초록      |  0.00 ~ 3.99  |
|     주황      |  4.00 ~ 6.99  |
|     빨강      |  7.00 ~ 9.99  |
|     자주      | 10.00 ~ 11.99 |
|      동       | 12.00 ~ 13.24 |
|      은       | 13.25 ~ 14.49 |
|      금       | 14.50 ~ 15.24 |
|    백금 ★     | 15.25 ~ 15.49 |
|    백금 ★★    | 15.50 ~ 15.74 |
|   백금 ★★★    | 15.75 ~ 15.99 |
|   무지개 ★    | 16.00 ~ 16.24 |
|   무지개 ★★   | 16.25 ~ 16.49 |
|  무지개 ★★★   | 16.50 ~ 16.74 |
|  무지개 ★★★★  | 16.75 ~ 16.99 |
|  무지개·극 ★  | 17.00 ~ 17.24 |
| 무지개·극 ★★  | 17.25 ~ 17.49 |
| 무지개·극 ★★★ |    17.50 ~    |

```typescript
type ChunithmTier = { name: string; min: number; max: number | null };

const CHUNITHM_TIERS: ChunithmTier[] = [
  { name: "초록", min: 0, max: 3.99 },
  { name: "주황", min: 4.0, max: 6.99 },
  { name: "빨강", min: 7.0, max: 9.99 },
  { name: "자주", min: 10.0, max: 11.99 },
  { name: "동", min: 12.0, max: 13.24 },
  { name: "은", min: 13.25, max: 14.49 },
  { name: "금", min: 14.5, max: 15.24 },
  { name: "백금 ★", min: 15.25, max: 15.49 },
  { name: "백금 ★★", min: 15.5, max: 15.74 },
  { name: "백금 ★★★", min: 15.75, max: 15.99 },
  { name: "무지개 ★", min: 16.0, max: 16.24 },
  { name: "무지개 ★★", min: 16.25, max: 16.49 },
  { name: "무지개 ★★★", min: 16.5, max: 16.74 },
  { name: "무지개 ★★★★", min: 16.75, max: 16.99 },
  { name: "무지개·극 ★", min: 17.0, max: 17.24 },
  { name: "무지개·극 ★★", min: 17.25, max: 17.49 },
  { name: "무지개·극 ★★★", min: 17.5, max: null },
];

function getChunithmTier(rating: number): ChunithmTier {
  return CHUNITHM_TIERS.findLast((t) => rating >= t.min) ?? CHUNITHM_TIERS[0];
}
```

---

## 주의사항

- 변환된 레이팅은 **참고용 추정값**이며 츄니즘 인게임 레이팅과 정확히 일치하지 않음
- 채보 DB의 버전 정보를 활용해 현행 버전 20곡 / 그 외 30곡을 구분하여 계산
- maimai 레벨에 +0.7을 더하는 보정값은 두 게임의 난이도 분포를 기반으로 한 추정값
