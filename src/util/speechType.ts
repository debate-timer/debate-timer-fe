export type SpeechTypeKey =
  | 'OPENING'
  | 'REBUTTAL'
  | 'TIMEOUT'
  | 'CLOSING'
  | 'CROSS_EXAM'
  | 'CUSTOM'
  | 'OPEN_DEBATE';

export const SPEECH_TYPE_RECORD: Record<SpeechTypeKey, string> = {
  OPENING: '입론',
  CLOSING: '최종발언',
  CUSTOM: '직접 입력',
  REBUTTAL: '반론',
  CROSS_EXAM: '교차조사',
  TIMEOUT: '작전시간',
  OPEN_DEBATE: '자유토론',
} as const;

const normalize = (value: string) => value.replace(/\s+/g, '').trim();

const SPEECH_TYPE_LABEL_BY_NORMALIZED = new Map(
  Object.values(SPEECH_TYPE_RECORD).map((label) => [normalize(label), label]),
);

export const normalizeSpeechTypeKey = (value: string): string | null => {
  const compact = normalize(value);
  return SPEECH_TYPE_LABEL_BY_NORMALIZED.get(compact) ?? null;
};
