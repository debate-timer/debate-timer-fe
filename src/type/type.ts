// Types
export type Stance = 'PROS' | 'CONS' | 'NEUTRAL';
export type TimeBasedStance = Exclude<Stance, 'NEUTRAL'>;
export type TimeBoxType = 'NORMAL' | 'TIME_BASED' | 'FEEDBACK';
export type CoinState = 'initial' | 'tossing' | 'front' | 'back';

export type BellType = 'BEFORE_END' | 'AFTER_END' | 'AFTER_START';
export type BellConfig = {
  type: BellType;
  time: number;
  count: number;
};

// Type converters
export const StanceToString: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
};

export const TimeBoxTypeToString: Record<TimeBoxType, string> = {
  NORMAL: '일반 타이머',
  TIME_BASED: '자유토론 타이머',
  FEEDBACK: '피드백 타이머',
};

export const BellTypeToString: Record<BellType, string> = {
  BEFORE_END: '종료 전',
  AFTER_END: '종료 후',
  AFTER_START: '시작 후',
};

// Interfaces
export interface User {
  id: string;
  name: string;
}

export interface TimeBoxInfo {
  stance: Stance;
  speechType: string;
  bell: BellConfig[] | null;
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

export interface CreatePollInfo {
  status: 'PROGRESS' | 'DONE';
  prosTeamName: string;
  consTeamName: string;
}
export interface PollInfo extends CreatePollInfo {
  totalCount: number;
  prosCount: number;
  consCount: number;
  voterNames: string[];
}

export interface VoterPollInfo {
  name: string;
  participateCode: string;
  team: 'PROS' | 'CONS';
}
export // ===== 배경 색상 상태 타입 및 컬러 맵 정의 =====
type TimerBGState = 'default' | 'warning' | 'danger' | 'expired';
export const bgColorMap: Record<TimerBGState, string> = {
  default: '',
  warning: 'bg-brand', // 30초~11초 구간
  danger: 'bg-semantic-warning', // 10초 이하
  expired: 'bg-default-timeout', // 0초 이하
};

type Action = {
  label: string; // 좌측에 표시할 토론 형식 이름 (예: "CEDA 토론")
  href: string; // 우측 "토론하기" 버튼의 이동 링크
};

export type DebateTemplate = {
  title: string; // 제목 (예: "서방정토")
  subtitle?: string; // 서브 제목 (예: "서강대")
  logoSrc?: string; // 로고 이미지
  actions: Action[];
  className?: string; // 카드의 추가 className이 필요하면 사용
};
