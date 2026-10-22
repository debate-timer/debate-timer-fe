import { Stance, TimeBasedStance } from './type';

// 음성 인식이 확정한 한 문장. offsetMs는 기록 시작 시점부터의 경과 시간이다.
export interface Utterance {
  offsetMs: number;
  text: string;
}

// 타이머가 한 번 실행되는 동안 인식한 발언 묶음
export interface SpeechSegment {
  timeBoxIndex: number;
  team: TimeBasedStance | null;
  utterances: Utterance[];
}

export type TranscriptStatus = 'PROCESSING' | 'DONE' | 'FAILED';

// 시간표 기준으로 화자가 구분된 속기록 한 줄
export interface TranscriptLine {
  index: number;
  timeBoxIndex: number;
  speechType: string;
  stance: Stance;
  speaker: string | null;
  offsetMs: number;
  text: string;
}

export type EvidenceType = 'SOURCED' | 'LOGICAL' | 'VAGUE' | 'NONE';

export interface ReportArgument {
  claim: string;
  evidences: { type: EvidenceType; content: string; lineIndex: number }[];
}

export interface ReportClash {
  title: string;
  prosPosition: string;
  consPosition: string;
  advantage: TimeBasedStance | 'EVEN';
  reason: string;
  lineIndices: number[];
}

export interface ReportKeyMoment {
  lineIndex: number;
  label: string;
  reason: string;
}

export interface ReportTeamFeedback {
  strengths: string[];
  weaknesses: string[];
}

export interface DebateReport {
  prosArguments: ReportArgument[];
  consArguments: ReportArgument[];
  clashes: ReportClash[];
  keyMoments: ReportKeyMoment[];
  teamFeedback: { pros: ReportTeamFeedback; cons: ReportTeamFeedback };
}
