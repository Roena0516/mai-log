# 아르케아(Arcaea) 포텐셜 변환 로직

## 개요

maimai DX 플레이 데이터(달성률, 레벨)를 기반으로
아르케아 포텐셜(Potential)을 계산하는 환산 로직.

---

## 아르케아 포텐셜 원본 공식

```
단일 포텐셜 = 달성도 포텐셜 (Score Potential)
최종 포텐셜 = (Recent 상위 10곡 + Best 30곡) 합산 / 40  (평균, 중복 불가)
```

### 달성도 포텐셜 계산

|           점수           |                      계산 공식                      |
| :----------------------: | :-------------------------------------------------: |
| PURE MEMORY (10,000,000) |                Base Potential + 2.0                 |
|      9,800,000 이상      | Base Potential + 1.0 + (점수 - 9,800,000) / 200,000 |
|      9,800,000 미만      |    Base Potential + (점수 - 9,500,000) / 300,000    |

> 9,500,000 미만의 경우 포텐셜이 음수가 될 수 있으며, 이는 아르케아의 의도된 설계.

---

## maimai → 아르케아 변환

### 1. Base Potential (레벨)

maimai 레벨(1.0 ~ 15.0)을 아르케아 레벨(0 ~ 12.0)로 선형 보간.

```typescript
const arcaeaLevel = Math.round((level / 15.0) * 12.0 * 10) / 10;

// 15.0 → 12.0 ✅
// 13.9 → 11.1 ✅
// 10.0 →  8.0 ✅
//  1.0 →  0.8 ✅
```

### 2. 점수 (achievement → Arcaea score)

maimai achievement(0 ~ 1,010,000)를 아르케아 점수(0 ~ 10,000,000)로 선형 보간.

```typescript
const arcaeaScore = Math.round((achievement / 1010000) * 10000000);

// 1,010,000 (101.0000%) → 10,000,000 (PURE MEMORY) ✅
// 1,000,000 (100.0000%) →  9,900,990              ✅
//   980,000 ( 98.0000%) →  9,702,970              ✅
//   950,000 ( 95.0000%) →  9,405,941              ✅
```

### 3. 단일 포텐셜 계산

```typescript
function calcArcaeaPotential(
  level: number,
  achievement: number, // 0 ~ 1,010,000
): number {
  const basePotential = Math.round((level / 15.0) * 12.0 * 10) / 10;
  const score = Math.round((achievement / 1010000) * 10000000);

  if (score >= 10000000) return basePotential + 2.0;
  if (score >= 9800000) return basePotential + 1.0 + (score - 9800000) / 200000;
  return basePotential + (score - 9500000) / 300000;
}
```

---

## 최종 포텐셜 계산

### Recent 프레임

아르케아 원본은 최근 30판 중 채보별 상위 10개이므로,
플레이로그 50개 중 앞에서 30개만 사용하여 근사.

```
Recent = 최근 30판 플레이로그에서 곡+난이도별 최고 달성률 추출 → 포텐셜 상위 10개
```

### Best 프레임

```
Best = 전체 기록에서 포텐셜 상위 30개 (Recent와 중복 불가)
```

### 최종

```
최종 포텐셜 = (Recent 10개 + Best 30개) 합산 / 40
```

```typescript
function calcTotalArcaeaPotential(
  records: Record[],
  recentLogs: RecentLog[], // 북마클릿에서 수집한 최근 50판
): number {
  // Recent: 최근 30판에서 곡+난이도별 최고 달성률 추출
  const recent30 = recentLogs.slice(0, 30);
  const recentMap = new Map<string, number>();

  for (const log of recent30) {
    const key = `${log.title}__${log.difficulty_type}__${log.is_dx}`;
    const current = recentMap.get(key) ?? 0;
    if (log.achievement > current) recentMap.set(key, log.achievement);
  }

  // records에서 레벨 정보 JOIN
  const recordMap = new Map(
    records.map((r) => [`${r.title}__${r.difficulty_type}__${r.is_dx}`, r]),
  );

  const recentPotentials = [...recentMap.entries()]
    .map(([key, achievement]) => {
      const record = recordMap.get(key);
      if (!record) return null;
      return {
        key,
        potential: calcArcaeaPotential(record.level, achievement),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.potential - a!.potential)
    .slice(0, 10);

  const recentKeys = new Set(recentPotentials.map((r) => r!.key));

  // Best: Recent에 없는 전체 기록 상위 30개
  const bestPotentials = records
    .map((r) => ({
      key: `${r.title}__${r.difficulty_type}__${r.is_dx}`,
      potential: calcArcaeaPotential(r.level, r.achievement),
    }))
    .filter((r) => !recentKeys.has(r.key))
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 30);

  const all = [
    ...recentPotentials.map((r) => r!.potential),
    ...bestPotentials.map((r) => r.potential),
  ];
  const sum = all.reduce((acc, v) => acc + v, 0);
  return Math.floor((sum / 40) * 100) / 100;
}
```

---

## 계산 예시

|  곡  | 레벨 | Base Potential |  달성률   |    환산 점수    |                    단일 포텐셜                    |
| :--: | :--: | :------------: | :-------: | :-------------: | :-----------------------------------------------: |
| 곡 A | 15.0 |      12.0      | 1,010,000 | 10,000,000 (PM) |                     **14.0**                      |
| 곡 B | 13.9 |      11.1      | 1,000,000 |    9,900,990    |      `11.1 + 1.0 + 100990/200000` = **12.6**      |
| 곡 C | 12.0 |      9.6       |  980,000  |    9,703,000    | `9.6 + 1.0 + (9703000-9800000)/200000` = **10.1** |
| 곡 D | 10.0 |      8.0       |  950,000  |    9,405,941    |    `8.0 + (9405941-9500000)/300000` = **7.7**     |
| 곡 E | 8.0  |      6.4       |  900,000  |    8,910,891    |    `6.4 + (8910891-9500000)/300000` = **4.4**     |

---

## 포텐셜 티어

|  아이콘  |      색상      |  포텐셜 범위  |
| :------: | :------------: | :-----------: |
|   기본   |  파랑 (Past)   |  0.00 ~ 2.99  |
|   기본   | 초록 (Present) |  3.00 ~ 6.99  |
|   기본   | 보라 (Future)  |  7.00 ~ 9.99  |
|   실버   | 보라 (Future)  | 10.00 ~ 10.99 |
|   골드   | 보라 (Future)  | 11.00 ~ 11.99 |
|  골드 ★  | 빨강 (Beyond)  | 12.00 ~ 12.49 |
| 골드 ★★  | 빨강 (Beyond)  | 12.50 ~ 12.99 |
| 골드 ★★★ | 빨강 (Beyond)  |    13.00 ~    |

```typescript
type ArcaeaTier = {
  name: string;
  color: string;
  min: number;
  max: number | null;
};

const ARCAEA_TIERS: ArcaeaTier[] = [
  { name: "기본", color: "past", min: 0, max: 2.99 },
  { name: "기본", color: "present", min: 3.0, max: 6.99 },
  { name: "기본", color: "future", min: 7.0, max: 9.99 },
  { name: "실버", color: "future", min: 10.0, max: 10.99 },
  { name: "골드", color: "future", min: 11.0, max: 11.99 },
  { name: "골드 ★", color: "beyond", min: 12.0, max: 12.49 },
  { name: "골드 ★★", color: "beyond", min: 12.5, max: 12.99 },
  { name: "골드 ★★★", color: "beyond", min: 13.0, max: null },
];

function getArcaeaTier(potential: number): ArcaeaTier {
  return ARCAEA_TIERS.findLast((t) => potential >= t.min) ?? ARCAEA_TIERS[0];
}
```

---

## 주의사항

- 변환된 포텐셜은 **참고용 추정값**이며 아르케아 인게임 포텐셜과 정확히 일치하지 않음
- 9,500,000 미만 점수는 포텐셜이 음수가 될 수 있으며 이는 의도된 동작
- Recent 프레임은 플레이로그 최근 30판 기준으로 근사하므로 오차 발생 가능
- maimai 레벨을 아르케아 레벨로 선형 보간하므로 실제 난이도 체감과 다를 수 있음
