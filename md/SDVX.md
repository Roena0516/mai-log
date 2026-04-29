# SDVX 볼포스 변환 로직

## 개요

maimai DX 플레이 데이터(달성률, 레벨, 클리어 마크)를 기반으로
SDVX 볼포스(VOLFORCE)를 계산하는 환산 로직.

---

## SDVX 볼포스 원본 공식

```
볼포스(단일) = floor(레벨 × 10 × 2 × (점수 / 10,000,000) × 클리어 보정 × 랭크 보정)
전체 볼포스 = 상위 50곡 볼포스 합산
```

---

## maimai → SDVX 변환

### 1. 레벨

maimai 레벨(1.0 ~ 15.0)을 SDVX 레벨(1.0 ~ 20.9)로 선형 보간.

```typescript
const sdvxLevel = Math.round((level / 15.0) * 20.9 * 10) / 10;

// 15.0 → 20.9 ✅
// 13.9 → 19.4 ✅
// 10.0 → 13.9 ✅
//  1.0 →  1.4 ✅
```

### 2. 점수 (achievement → SDVX score)

maimai 달성률(0 ~ 1,010,000)을 SDVX 점수(0 ~ 10,000,000)로 선형 보간.

```typescript
const sdvxScore = Math.round((achievement / 1010000) * 10000000);

// 1010000 (101.0000%) → 10,000,000 ✅
// 1000000 (100.0000%) →  9,900,990 ✅
// 970000  ( 97.0000%) →  9,603,960 ✅
// 0       (  0.0000%) →          0 ✅
```

### 3. 클리어 마크 보정

| maimai 클리어 마크 | SDVX 대응 | 보정값 |
| :----------------: | :-------: | :----: |
|    `app` (AP+)     |    PUC    |  1.1   |
|     `ap` (AP)      |    UC     |  1.06  |
|    `fcp` (FC+)     | EX 클리어 |  1.06  |
|     `fc` (FC)      | EX 클리어 |  1.06  |
|      `clear`       | EF 클리어 |  1.0   |

> FDX, FDX+, SYNC, FS, FS+, FSD, FSD+는 2인 플레이 마크이므로 보정에 미반영.

```typescript
const CLEAR_BONUS: Record<string, number> = {
  app: 1.1,
  ap: 1.06,
  fcp: 1.06,
  fc: 1.06,
  clear: 1.0,
};

const clearBonus = CLEAR_BONUS[clearMark] ?? 1.0;
```

### 4. 랭크 보정

maimai 달성률 기준으로 SDVX 랭크를 매핑.

|    maimai 달성률    | SDVX 랭크 | 랭크 보정 |
| :-----------------: | :-------: | :-------: |
| 1,010,000 (101.00%) |     S     |   1.05    |
| 1,000,000 (100.00%) |   AAA+    |   1.02    |
|  990,000 ( 99.00%)  |    AAA    |   1.00    |
|  970,000 ( 97.00%)  |    AA+    |   0.97    |
|  940,000 ( 94.00%)  |    AA     |   0.94    |
|  900,000 ( 90.00%)  |    A+     |   0.91    |
|  800,000 ( 80.00%)  |     A     |   0.88    |
|  750,000 ( 75.00%)  |     B     |   0.85    |
|  700,000 ( 70.00%)  |     C     |   0.82    |
|      ~ 699,999      |     D     |    0.8    |

```typescript
function getRankBonus(achievement: number): number {
  if (achievement >= 1010000) return 1.05;
  if (achievement >= 1000000) return 1.02;
  if (achievement >= 990000) return 1.0;
  if (achievement >= 970000) return 0.97;
  if (achievement >= 940000) return 0.94;
  if (achievement >= 900000) return 0.91;
  if (achievement >= 800000) return 0.88;
  if (achievement >= 750000) return 0.85;
  if (achievement >= 700000) return 0.82;
  return 0.8;
}
```

---

## 최종 변환 함수

```typescript
function calcSdvxVolforce(
  level: number,
  achievement: number, // 0 ~ 1,010,000
  clearMark: string, // 'app' | 'ap' | 'fcp' | 'fc' | 'clear'
): number {
  const sdvxLevel = Math.round((level / 15.0) * 20.9 * 10) / 10;
  const sdvxScore = Math.round((achievement / 1010000) * 10000000);
  const clearBonus = CLEAR_BONUS[clearMark] ?? 1.0;
  const rankBonus = getRankBonus(achievement);

  return Math.floor(
    sdvxLevel * 10 * 2 * (sdvxScore / 10000000) * clearBonus * rankBonus,
  );
}

function calcTotalVolforce(records: Record[]): number {
  return records
    .map((r) => calcSdvxVolforce(r.level, r.achievement, r.clearMark))
    .sort((a, b) => b - a)
    .slice(0, 50)
    .reduce((sum, v) => sum + v, 0);
}
```

---

## 계산 예시

|  곡  | 레벨 | 환산 레벨 |      달성률      | 클리어 |                    볼포스                    |
| :--: | :--: | :-------: | :--------------: | :----: | :------------------------------------------: |
| 곡 A | 15.0 |   20.9    | 1,010,000 (AP+)  |  app   |  `floor(20.9×10×2×1.0×1.1×1.05)` = **481**   |
| 곡 B | 13.9 |   19.4    |  1,000,000 (FC)  |   fc   | `floor(19.4×10×2×0.990×1.06×1.02)` = **415** |
| 곡 C | 12.0 |   16.7    | 970,000 (클리어) | clear  | `floor(16.7×10×2×0.960×1.0×0.97)` = **311**  |

---

## 티어 기준

```typescript
type Tier = { name: string; level: number; min: number; max: number | null };

const TIERS: Tier[] = [
  { name: "시에나", level: 1, min: 0, max: 2.499 },
  { name: "시에나", level: 2, min: 2.5, max: 4.999 },
  { name: "시에나", level: 3, min: 5.0, max: 7.499 },
  { name: "시에나", level: 4, min: 7.5, max: 9.999 },
  { name: "코발트", level: 1, min: 10.0, max: 10.499 },
  { name: "코발트", level: 2, min: 10.5, max: 10.999 },
  { name: "코발트", level: 3, min: 11.0, max: 11.499 },
  { name: "코발트", level: 4, min: 11.5, max: 11.999 },
  { name: "댄딜라이언", level: 1, min: 12.0, max: 12.499 },
  { name: "댄딜라이언", level: 2, min: 12.5, max: 12.999 },
  { name: "댄딜라이언", level: 3, min: 13.0, max: 13.499 },
  { name: "댄딜라이언", level: 4, min: 13.5, max: 13.999 },
  { name: "시안", level: 1, min: 14.0, max: 14.249 },
  { name: "시안", level: 2, min: 14.25, max: 14.499 },
  { name: "시안", level: 3, min: 14.5, max: 14.749 },
  { name: "시안", level: 4, min: 14.75, max: 14.999 },
  { name: "스칼렛", level: 1, min: 15.0, max: 15.249 },
  { name: "스칼렛", level: 2, min: 15.25, max: 15.499 },
  { name: "스칼렛", level: 3, min: 15.5, max: 15.749 },
  { name: "스칼렛", level: 4, min: 15.75, max: 15.999 },
  { name: "코랄", level: 1, min: 16.0, max: 16.249 },
  { name: "코랄", level: 2, min: 16.25, max: 16.499 },
  { name: "코랄", level: 3, min: 16.5, max: 16.749 },
  { name: "코랄", level: 4, min: 16.75, max: 16.999 },
  { name: "아르젠토", level: 1, min: 17.0, max: 17.249 },
  { name: "아르젠토", level: 2, min: 17.25, max: 17.499 },
  { name: "아르젠토", level: 3, min: 17.5, max: 17.749 },
  { name: "아르젠토", level: 4, min: 17.75, max: 17.999 },
  { name: "엘도라", level: 1, min: 18.0, max: 18.249 },
  { name: "엘도라", level: 2, min: 18.25, max: 18.499 },
  { name: "엘도라", level: 3, min: 18.5, max: 18.749 },
  { name: "엘도라", level: 4, min: 18.75, max: 18.999 },
  { name: "크림슨", level: 1, min: 19.0, max: 19.249 },
  { name: "크림슨", level: 2, min: 19.25, max: 19.499 },
  { name: "크림슨", level: 3, min: 19.5, max: 19.749 },
  { name: "크림슨", level: 4, min: 19.75, max: 19.999 },
  { name: "임페리얼", level: 1, min: 20.0, max: 20.999 },
  { name: "임페리얼", level: 2, min: 21.0, max: 21.999 },
  { name: "임페리얼", level: 3, min: 22.0, max: 22.999 },
  { name: "임페리얼", level: 4, min: 23.0, max: null },
];

function getTier(volforce: number): Tier {
  return TIERS.findLast((t) => volforce >= t.min) ?? TIERS[0];
}
```

---

## 주의사항

- 변환된 볼포스는 **참고용 추정값**이며 SDVX 인게임 볼포스와 정확히 일치하지 않음
- maimai 레벨을 SDVX 레벨로 선형 보간하므로 실제 난이도 체감과 다를 수 있음
