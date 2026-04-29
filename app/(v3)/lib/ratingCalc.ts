export function maimaiRS(ach: number, lv: number): number {
  let mul: number;
  if (ach >= 100.5)     mul = 22.4;
  else if (ach >= 100)  mul = 21.6 + ((ach - 100) / 0.5) * 0.8;
  else if (ach >= 99.5) mul = 21.1 + ((ach - 99.5) / 0.5) * 0.5;
  else if (ach >= 99)   mul = 20.8 + ((ach - 99) / 0.5) * 0.3;
  else if (ach >= 98)   mul = 20.3 + (ach - 98) * 0.5;
  else if (ach >= 97)   mul = 20 + (ach - 97) * 0.3;
  else                  mul = 16.8;
  return Math.floor(lv * mul);
}

export function chunithumRS(ach: number, lv: number): number {
  let score: number;
  if (ach >= 101)       score = 1010000;
  else if (ach >= 100.5) score = 1009500 + (ach - 100.5) * 1000;
  else if (ach >= 100)  score = 1009000 + (ach - 100) * 1000;
  else if (ach >= 99)   score = 1000000 + (ach - 99) * 9000;
  else if (ach >= 97.5) score = 975000 + (ach - 97.5) * 16667;
  else                  score = ach * 9800;

  let bonus: number;
  if (score >= 1009000)      bonus = 2.15;
  else if (score >= 1007500) bonus = 2 + ((score - 1007500) / 1500) * 0.15;
  else if (score >= 1005000) bonus = 1.5 + ((score - 1005000) / 2500) * 0.5;
  else if (score >= 1000000) bonus = 1 + ((score - 1000000) / 5000) * 0.5;
  else if (score >= 975000)  bonus = (score - 975000) / 25000;
  else                       bonus = -3;

  return Math.floor((lv + bonus) * 100) / 100;
}

export function sdvxRS(ach: number, lv: number): number {
  const score = Math.min(
    ach >= 101  ? 10000000
    : ach >= 100 ? 9900000 + (ach - 100) * 100000
    : ach >= 98  ? 9700000 + (ach - 98) * 100000
    : ach >= 97  ? 9500000 + (ach - 97) * 200000
    : ach * 95000,
    10000000,
  );
  return Math.floor(lv * (score / 10000000) * 0.5 * 1000) / 1000;
}

export function arcaeaRS(ach: number, lv: number): number {
  const score = Math.min(
    ach >= 101   ? 10002500
    : ach >= 100.5 ? 10001000 + (ach - 100.5) * 3000
    : ach >= 100   ? 10000000 + (ach - 100) * 2000
    : ach >= 99    ? 9900000 + (ach - 99) * 100000
    : ach * 97000,
    10002500,
  );
  let mod: number;
  if (score >= 10000000)      mod = 2 + (score - 10000000) / 2500;
  else if (score >= 9800000)  mod = ((score - 9800000) / 200000) * 2 - 1;
  else if (score >= 9500000)  mod = ((score - 9500000) / 300000) * 2 - 4;
  else                        mod = -6;
  return Math.floor((lv + Math.min(mod, 2)) * 100) / 100;
}
