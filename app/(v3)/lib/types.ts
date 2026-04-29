export type GameId = 'maimai' | 'chunithm' | 'sdvx' | 'arcaea';

export type DiffType = 'BASIC' | 'ADVANCED' | 'EXPERT' | 'MASTER' | 'Re:MASTER';

export type MarkType =
  | 'AP+' | 'AP' | 'FC+' | 'FC'
  | 'FSD+' | 'FSD' | 'FS+' | 'FS' | 'SYNC';

export interface Song {
  diff: DiffType;
  name: string;
  ach: number;
  marks: MarkType[];
  lv: number;
  isDx?: boolean;
  isNewVersion?: boolean;
}

export interface RecentLogEntry {
  name: string;
  ach: number;
  lv: number;
  isDx: boolean;
  diff: string;
}
