export type Stance = 'PROS' | 'CONS' | 'NEUTRAL';
export type DebateType =
  | 'OPENING'
  | 'REBUTTAL'
  | 'CROSS'
  | 'CLOSING'
  | 'TIME_OUT';

export const DEBATE_TYPE_LABELS: Record<DebateType, string> = {
  OPENING: '입론',
  REBUTTAL: '반론',
  CROSS: '교차질의',
  CLOSING: '최종발언',
  TIME_OUT: '작전 시간',
};

export interface User {
  id: string;
  name: string;
}

export interface DebateInfo {
  stance: Stance;
  type: DebateType;
  time: number;
  speakerNumber?: number;
}

export interface DebateTable {
  id: number;
  name: string;
  type: string;
  duration: number;
}

export interface TableInfo {
  info: {
    name: string;
    agenda: string;
  };
  table: DebateInfo[];
}
