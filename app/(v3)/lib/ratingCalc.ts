// ── maimai DX ────────────────────────────────────────────────────────────────
// ach 단위: 퍼센트 소수 (e.g. 100.5499) → 내부에서 × 10000하여 정수 사용

function getMaimaiCoefficient(achInt: number): number {
  if (achInt >= 1005000) return 22.4;
  if (achInt >= 1000000) return 21.6;
  if (achInt >= 995000)  return 21.1;
  if (achInt >= 990000)  return 20.8;
  if (achInt >= 980000)  return 20.3;
  if (achInt >= 970000)  return 20.0;
  return 0; // S 미만: 레이팅 기여 없음
}

export function maimaiRS(ach: number, lv: number, marks: string[] = []): number {
  const achInt = Math.round(ach * 10000);
  const coeff  = getMaimaiCoefficient(achInt);
  if (coeff === 0) return 0;
  const capped  = Math.min(achInt, 1005000);
  const apBonus = marks.includes('AP+') || marks.includes('AP') ? 1 : 0;
  return Math.floor((lv * capped / 1000000) * coeff) + apBonus;
}

// ── CHUNITHM ─────────────────────────────────────────────────────────────────
// 레벨: +0.7
// 점수: maimai achievement 정수 그대로 사용 (두 게임 최대 점수 동일)
// 보정값: 구간별 Math.floor 스텝

function getChunithmBonus(score: number): number {
  if (score >= 1009000) return 2.15;
  if (score >= 1007500) return 2.0  + Math.floor((score - 1007500) / 100) * 0.01;
  if (score >= 1005000) return 1.5  + Math.floor((score - 1005000) / 50)  * 0.01;
  if (score >= 1000000) return 1.0  + Math.floor((score - 1000000) / 100) * 0.01;
  if (score >= 990000)  return 0.6  + Math.floor((score - 990000)  / 250) * 0.01;
  if (score >= 975000)  return 0.0  + Math.floor((score - 975000)  / 250) * 0.01;
  if (score >= 950000)  return -1.67 + Math.floor((score - 950000) / 150) * 0.01;
  if (score >= 925000)  return -3.34 + Math.floor((score - 925000) / 150) * 0.01;
  return -5.0;
}

export function chunithumRS(ach: number, lv: number, _marks: string[] = []): number {
  const chuniScore = Math.round(ach * 10000); // achievement 정수 그대로
  const chuniLevel = lv + 0.7;
  const bonus = getChunithmBonus(chuniScore);
  return Math.max(0, Math.floor((chuniLevel + bonus) * 100) / 100);
}

// ── SOUND VOLTEX ─────────────────────────────────────────────────────────────
// 반환값: 밀리-VF (정수). 표시 시 / 1000 → 소수점 3자리
// 공식: floor(sdvxLevel × 10 × 2 × (sdvxScore / 10,000,000) × 클리어 보정 × 랭크 보정)

function getSdvxClearBonus(marks: string[]): number {
  if (marks.includes('AP+'))                                                    return 1.10;
  if (marks.includes('AP') || marks.includes('FC+') || marks.includes('FC'))   return 1.06;
  return 1.0;
}

function getSdvxRankBonus(achInt: number): number {
  if (achInt >= 1010000) return 1.05;
  if (achInt >= 1000000) return 1.02;
  if (achInt >= 990000)  return 1.00;
  if (achInt >= 970000)  return 0.97;
  if (achInt >= 940000)  return 0.94;
  if (achInt >= 900000)  return 0.91;
  if (achInt >= 800000)  return 0.88;
  if (achInt >= 750000)  return 0.85;
  if (achInt >= 700000)  return 0.82;
  return 0.80;
}

export function sdvxRS(ach: number, lv: number, marks: string[] = []): number {
  const achInt    = Math.round(ach * 10000);
  const sdvxLevel = Math.round((lv / 15.0) * 20.9 * 10) / 10;
  const sdvxScore = Math.round((achInt / 1010000) * 10000000);
  const clearBon  = getSdvxClearBonus(marks);
  const rankBon   = getSdvxRankBonus(achInt);
  return Math.floor(sdvxLevel * 10 * 2 * (sdvxScore / 10000000) * clearBon * rankBon);
}

// ── Arcaea ───────────────────────────────────────────────────────────────────
// 레벨: maimai 0~15.0 → Arcaea 0~12.0 선형 보간
// 점수: (achInt / 1010000) × 10000000 선형 보간
// 단일 포텐셜: PM(10M) +2.0 / ≥9.8M: +1.0+(x-9.8M)/200K / 그 외: (x-9.5M)/300K

export function arcaeaRS(ach: number, lv: number, _marks: string[] = []): number {
  const achInt       = Math.round(ach * 10000);
  const basePotential = Math.round((lv / 15.0) * 12.0 * 10) / 10;
  const score        = Math.round((achInt / 1010000) * 10000000);

  let potential: number;
  if (score >= 10000000) {
    potential = basePotential + 2.0;
  } else if (score >= 9800000) {
    potential = basePotential + 1.0 + (score - 9800000) / 200000;
  } else {
    potential = basePotential + (score - 9500000) / 300000; // 9.5M 미만 시 음수 가능
  }

  return Math.floor(potential * 100) / 100;
}
