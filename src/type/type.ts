// Types
export type Stance = 'PROS' | 'CONS' | 'NEUTRAL';
export type TimeBasedStance = Exclude<Stance, 'NEUTRAL'>;
export type TimeBoxType = 'NORMAL' | 'TIME_BASED';

// Type converters
export const StanceToString: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
};

export const TimeBoxTypeToString: Record<TimeBoxType, string> = {
  NORMAL: '일반 타이머',
  TIME_BASED: '자유토론 타이머',
};

// Interfaces
export interface User {
  id: string;
  name: string;
}

export interface TimeBoxInfo {
  stance: Stance;
  speechType: string;
  boxType: TimeBoxType;
  time: number | null;
  timePerTeam: number | null;
  timePerSpeaking: number | null;
  speaker: string | null;
}

export interface DebateInfo {
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
  agenda: string;
}

export interface DebateTableData {
  info: DebateInfo;
  table: TimeBoxInfo[];
}

// ===== 배경 색상 상태 타입 및 컬러 맵 정의 =====
export type TimerBGState = 'default' | 'warning' | 'danger' | 'expired';
export const bgColorMap: Record<TimerBGState, string> = {
  default: '',
  warning: 'bg-brand-main', // 30초~11초 구간
  danger: 'bg-brand-sub3', // 10초 이하
  expired: 'bg-neutral-700', // 0초 이하
};
