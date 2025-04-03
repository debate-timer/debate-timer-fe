// Types
export type Stance = 'PROS' | 'CONS' | 'NEUTRAL';
export type ParliamentarySpeechType =
  | 'OPENING'
  | 'REBUTTAL'
  | 'CROSS'
  | 'CLOSING'
  | 'TIME_OUT';
export type CustomizeTimeBoxType = 'NORMAL' | 'TIME_BASED';
export type DebateType = 'PARLIAMENTARY' | 'CUSTOMIZE';

// Type converters
export const StanceToString: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
};

export const ParliamentarySpeechTypeToString: Record<
  ParliamentarySpeechType,
  string
> = {
  OPENING: '입론',
  REBUTTAL: '반론',
  CROSS: '교차 질의',
  CLOSING: '최종 발언',
  TIME_OUT: '작전 시간',
};

export const CustomizeTimeBoxTypeToString: Record<
  CustomizeTimeBoxType,
  string
> = {
  NORMAL: '일반 타이머',
  TIME_BASED: '자유토론 타이머',
};

export const DebateTypeToString: Record<DebateType, string> = {
  PARLIAMENTARY: '의회식 토론',
  CUSTOMIZE: '사용자 지정 토론',
};

// Interfaces
export interface User {
  id: string;
  name: string;
}

export interface ParliamentaryTimeBoxInfo {
  stance: Stance;
  type: ParliamentarySpeechType;
  time: number;
  speakerNumber?: number;
}

export interface CustomizeTimeBoxInfo {
  stance: Stance;
  speechType: string;
  boxType: CustomizeTimeBoxType;
  time: number | null;
  timePerTeam: number | null;
  timePerSpeaking: number | null;
  speaker: string;
}

export interface ParliamentaryDebateInfo {
  name: string;
  agenda: string;
  warningBell: boolean;
  finishBell: boolean;
}

export interface CustomizeDebateInfo {
  name: string;
  agenda: string;
  prosTeamName: string;
  consTeamName: string;
  warningBell: boolean;
  finishBell: boolean;
}

export interface DebateTable {
  id: number;
  name: string;
  type: DebateType;
  agenda: string;
}
