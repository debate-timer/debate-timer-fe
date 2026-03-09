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

export interface BasePollInfo {
  status: 'PROGRESS' | 'DONE';
  prosTeamName: string;
  consTeamName: string;
}
export interface PollInfo extends BasePollInfo {
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

export type TimerBGState = 'default' | 'warning' | 'danger' | 'expired';
export const bgColorMap: Record<TimerBGState, string> = {
  default: '',
  warning: 'bg-brand', // 30초~11초 구간
  danger: 'bg-semantic-warning', // 10초 이하
  expired: 'bg-default-timeout', // 0초 이하
};

export type DebateTemplate = {
  name: string; // 템플릿 이름
  data: string; // 인코딩된 템플릿 데이터
};

export type Organization = {
  organization: string; // 소분류 (e.g., 한앎)
  affiliation: string; // 대분류 (e.g., 한양대)
  iconPath: string;
  templates: DebateTemplate[];
};

type TeamStyleConfig = {
  baseBg: string;
  baseBorder: string;
  label: string;
  name: string;
};
export type TeamKey = TimeBasedStance;
export const TEAM_STYLE: Record<TeamKey, TeamStyleConfig> = {
  PROS: {
    baseBg: 'bg-[#C2E8FF]',
    baseBorder: 'border-[#1E91D6]',
    label: 'text-[#1E91D6]',
    name: 'text-[#1E91D6]',
  },
  CONS: {
    baseBg: 'bg-[#FFC7D3]',
    baseBorder: 'border-[#E14666]',
    label: 'text-[#E14666]',
    name: 'text-[#E14666]',
  },
};
