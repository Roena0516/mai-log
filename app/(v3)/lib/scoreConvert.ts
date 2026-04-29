import type { GameId, DiffType } from './types';

const SCORE_RANKS = ['SSS+','SSS','SS+','SS','S+','S','AAA','AA','A','BBB','BB','B','C','D'];

export function getScoreRank(ach: number): string {
  if (ach >= 100.5) return 'SSS+';
  if (ach >= 100.0) return 'SSS';
  if (ach >= 99.5)  return 'SS+';
  if (ach >= 99.0)  return 'SS';
  if (ach >= 98.0)  return 'S+';
  if (ach >= 97.0)  return 'S';
  if (ach >= 94.0)  return 'AAA';
  if (ach >= 90.0)  return 'AA';
  if (ach >= 80.0)  return 'A';
  if (ach >= 75.0)  return 'BBB';
  if (ach >= 70.0)  return 'BB';
  if (ach >= 60.0)  return 'B';
  if (ach >= 50.0)  return 'C';
  return 'D';
}

export function getChunithumScoreRank(ach: number): string {
  const score = Math.round(ach * 10000);
  if (score >= 1009000) return 'SSS+';
  if (score >= 1007500) return 'SSS';
  if (score >= 1005000) return 'SS+';
  if (score >= 1000000) return 'SS';
  if (score >= 990000)  return 'S+';
  if (score >= 975000)  return 'S';
  if (score >= 950000)  return 'AAA';
  if (score >= 925000)  return 'AA';
  if (score >= 900000)  return 'A';
  if (score >= 800000)  return 'BBB';
  if (score >= 700000)  return 'BB';
  if (score >= 600000)  return 'B';
  if (score >= 500000)  return 'C';
  return 'D';
}

export function convertScore(ach: number, game: GameId): string {
  if (game === 'maimai') return ach.toFixed(4) + '%';

  let score: number;
  if (game === 'chunithm') {
    if (ach >= 101)       score = 1010000;
    else if (ach >= 100.5) score = Math.round(1009500 + (ach - 100.5) * 1000);
    else if (ach >= 100)  score = Math.round(1009000 + (ach - 100) * 1000);
    else if (ach >= 99)   score = Math.round(1000000 + (ach - 99) * 9000);
    else if (ach >= 97.5) score = Math.round(975000 + (ach - 97.5) * 16667);
    else                  score = Math.round(ach * 9800);
  } else if (game === 'sdvx') {
    score = Math.min(
      ach >= 101  ? 10000000
      : ach >= 100 ? Math.round(9900000 + (ach - 100) * 100000)
      : ach >= 98  ? Math.round(9700000 + (ach - 98) * 100000)
      : ach >= 97  ? Math.round(9500000 + (ach - 97) * 200000)
      : Math.round(ach * 95000),
      10000000,
    );
  } else {
    score = Math.min(
      ach >= 101   ? 10002500
      : ach >= 100.5 ? Math.round(10001000 + (ach - 100.5) * 3000)
      : ach >= 100   ? Math.round(10000000 + (ach - 100) * 2000)
      : ach >= 99    ? Math.round(9900000 + (ach - 99) * 100000)
      : Math.round(ach * 97000),
      10002500,
    );
  }
  return score.toLocaleString();
}

export function convertDiff(lv: number, game: GameId, diff: DiffType): string | null {
  if (game === 'maimai') return null;
  if (game === 'chunithm') {
    if (diff === 'Re:MASTER') return 'ULTIMA';
    return diff;
  }
  if (game === 'sdvx') {
    if (lv >= 14) return 'MAXIMUM';
    if (lv >= 11) return 'EXHAUST';
    if (lv >= 8)  return 'ADVANCED';
    return 'NOVICE';
  }
  if (game === 'arcaea') {
    if (lv >= 9) return 'Beyond';
    if (lv >= 7) return 'Future';
    if (lv >= 5) return 'Present';
    return 'Past';
  }
  return null;
}

export function convertMarks(marks: string[], game: GameId): string[] {
  if (game === 'maimai') return marks;

  const hasAP  = marks.includes('AP+') || marks.includes('AP');
  const hasFC  = marks.includes('FC+') || marks.includes('FC');
  const hasFS  = ['FSD+','FSD','FS+','FS'].some(m => marks.includes(m));
  const hasSSS = marks.includes('SSS+') || marks.includes('SSS');

  if (game === 'chunithm') {
    return marks
      .filter(m => !['SYNC','FS','FS+','FSD','FSD+'].includes(m))
      .map(m => m === 'AP+' ? 'AJC' : m === 'AP' ? 'AJ' : m);
  }
  if (game === 'sdvx') {
    if (hasAP && hasSSS) return ['PUC'];
    if (hasAP || hasFC)  return ['UC'];
    if (hasFS)           return ['HC'];
    return ['CLEAR'];
  }
  if (game === 'arcaea') {
    if (hasAP) return ['PM'];
    if (hasFC) return ['FR'];
    return ['CLEAR'];
  }
  return marks;
}

export function buildDisplayMarks(ach: number, marks: string[], game: GameId): string[] {
  const scoreRank = game === 'chunithm' ? getChunithumScoreRank(ach) : getScoreRank(ach);
  const baseMarks = [scoreRank, ...marks.filter(m => !SCORE_RANKS.includes(m))];
  return convertMarks(baseMarks, game);
}

export const MARK_SLOTS: Record<GameId, string[][]> = {
  maimai: [
    ['SSS+','SSS','SS+','SS','S+','S','AAA','AA','A','BBB','BB','B','C','D'],
    ['AP+','AP','FC+','FC'],
    ['FSD+','FSD','FS+','FS','SYNC'],
  ],
  chunithm: [
    ['SSS+','SSS','SS+','SS','S+','S','AAA','AA','A','BBB','BB','B','C','D'],
    ['AJC','AJ','FC+','FC'],
  ],
  sdvx:   [['PUC'],['UC'],['HC'],['CLEAR']],
  arcaea: [['PM'],['FR'],['CLEAR']],
};

export const MAI_CM_COLOR: Record<string, string> = {
  'SSS+':'#d97706','SSS':'#f59e0b','SS+':'#fbbf24','SS':'#fbbf24',
  'S+':'#fb923c','S':'#fb923c','AAA':'#60a5fa','AA':'#60a5fa','A':'#93c5fd',
  'BBB':'#7dd3fc','BB':'#bae6fd','B':'#e0f2fe',
  'C':'#d1d5db','D':'#9ca3af',
  'AP+':'#d946ef','AP':'#d946ef','FC+':'#3b82f6','FC':'#60a5fa',
  'FS+':'#22c55e','FS':'#4ade80','FSD+':'#10b981','FSD':'#34d399',
  'SYNC':'#94a3b8',
};

export const GAME_CM_COLOR: Record<string, Record<string, string>> = {
  chunithm: {
    ...MAI_CM_COLOR,
    'AJC':'#ca8a04','AJ':'#f59e0b',
  },
  sdvx:   { 'PUC':'#ca8a04','UC':'#f59e0b','HC':'#3b82f6','CLEAR':'#6b7280' },
  arcaea: { 'PM':'#ca8a04','FR':'#3b82f6','CLEAR':'#6b7280' },
};

export const MAI_DIFF_COLOR: Record<string, string> = {
  'BASIC':'#16a34a',
  'ADVANCED':'#ea580c',
  'EXPERT':'#dc2626',
  'MASTER':'#9333ea',
  'Re:MASTER':'#7c3aed',
};

export const GAME_DIFF_COLOR: Record<string, Record<string, string>> = {
  chunithm: {
    'BASIC':'#16a34a','ADVANCED':'#d97706','EXPERT':'#dc2626',
    'MASTER':'#9333ea','ULTIMA':'#555555',
  },
  sdvx: {
    'NOVICE':'#16a34a','ADVANCED':'#2563eb','EXHAUST':'#dc2626','MAXIMUM':'#7c3aed',
  },
  arcaea: {
    'Past':'#64748b','Present':'#059669','Future':'#7c3aed','Beyond':'#dc2626',
  },
};
