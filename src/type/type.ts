export type Stance = 'PROS' | 'CONS' | 'NEUTRAL';
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
  CLOSING: '최종 발언',
  TIME_OUT: '작전 시간',
};

export interface User {
  id: string;
  name: string;
}

export interface TimeBoxInfo {
  stance: Stance;
  type: DebateType;
  time: number;
  speakerNumber?: number;
}

export interface DetailDebateInfo {
  name: string;
  agenda: string;
  warningBell: boolean;
  finishBell: boolean;
}

export interface DebateTable {
  id: number;
  name: string;
  type: Type;
  duration: number;
}

export type Type = 'PARLIAMENTARY';
