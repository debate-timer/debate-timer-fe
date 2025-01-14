export type Stance = 'PROS' | 'CONS' | 'NETURAL';
export type DebateType =
  | 'OPENING'
  | 'REBUTTAL'
  | 'CROSS'
  | 'CLOSING'
  | 'TIME_OUT';

export const StanceToString: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
};

export const DebateTypeToString: Record<DebateType, string> = {
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
  type: Type;
  duration: number;
}

export type Type = 'PARLIAMENTARY' | '';
