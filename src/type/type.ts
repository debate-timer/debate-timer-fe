export type Stance = 'PROS' | 'CONS' | 'NEUTRAL';
export type DebateType =
  | 'OPENING'
  | 'REBUTTAL'
  | 'CROSS'
  | 'CLOSING'
  | 'TIME_OUT';

export interface DebateInfo {
  stance: Stance;
  debateType: DebateType;
  time: number;
  speakerNumber: number;
}

export const DEBATE_TYPE_LABELS: Record<DebateType, string> = {
  OPENING: '입론',
  REBUTTAL: '반론',
  CROSS: '교차질의',
  CLOSING: '최종발언',
  TIME_OUT: '작전 시간',
};
