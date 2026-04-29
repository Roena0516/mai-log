import type { GameId } from './types';
import { maimaiRS, chunithumRS, sdvxRS, arcaeaRS } from './ratingCalc';

export interface GameConfig {
  id: GameId;
  label: string;
  accent: string;
  ratingLabel: string;
  rsLabel: string;
  calcRS: (ach: number, lv: number, marks: string[]) => number;
  formatRS: (v: number) => string;
  formatTotal: (v: number) => string;
}

export const GAMES: Record<GameId, GameConfig> = {
  maimai: {
    id: 'maimai',
    label: 'maimai DX',
    accent: '#9333ea',
    ratingLabel: 'RATING',
    rsLabel: 'RATING',
    calcRS: maimaiRS,
    formatRS: (v) => String(v),
    formatTotal: (v) => String(v),
  },
  chunithm: {
    id: 'chunithm',
    label: 'CHUNITHM',
    accent: '#f97316',
    ratingLabel: 'RATING',
    rsLabel: 'CHU',
    calcRS: chunithumRS,
    formatRS: (v) => v.toFixed(2),
    formatTotal: (v) => v.toFixed(2),
  },
  sdvx: {
    id: 'sdvx',
    label: 'SOUND VOLTEX',
    accent: '#38bdf8',
    ratingLabel: 'VOLFORCE',
    rsLabel: 'VF',
    calcRS: sdvxRS,
    // 밀리-VF → VF (/ 1000)
    formatRS: (v) => (v / 1000).toFixed(3),
    formatTotal: (v) => (v / 1000).toFixed(3),
  },
  arcaea: {
    id: 'arcaea',
    label: 'Arcaea',
    accent: '#a855f7',
    ratingLabel: 'POTENTIAL',
    rsLabel: 'PTT',
    calcRS: arcaeaRS,
    formatRS: (v) => v.toFixed(2),
    formatTotal: (v) => v.toFixed(2),
  },
};

export const GAME_IDS: GameId[] = ['maimai', 'chunithm', 'sdvx', 'arcaea'];
