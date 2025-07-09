import { UUID } from 'crypto';

// Types
export type Stance = 'PROS' | 'CONS' | 'NEUTRAL';
export type TimeBoxType = 'NORMAL' | 'TIME_BASED';

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
  id: UUID;
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
