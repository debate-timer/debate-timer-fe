import type { TFunction } from 'i18next';

/**
 * 토론 테이블 입력값 검증 규칙.
 * 값은 debate-timer-be 의 도메인 제약과 동일하게 유지해야 한다.
 * - TableName.NAME_MAX_LENGTH = 20 / TeamName.NAME_MAX_LENGTH = 15 / Agenda.AGENDA_MAX_LENGTH = 255
 * - CustomizeTimeBox.SPEECH_TYPE_MAX_LENGTH = 10 / SPEAKER_MAX_LENGTH = 5
 */
export const TABLE_FIELD_LIMITS = {
  name: 20,
  teamName: 15,
  agenda: 255,
  speechType: 10,
  speaker: 5,
} as const;

// 입력 검증(붉은 테두리) 디바운스 지연(ms). 카운터는 라이브 값이라 즉시 반응하므로,
// 테두리와의 인지 간극을 줄이기 위해 짧게 유지한다.
export const VALIDATION_DEBOUNCE_MS = 200;

// TableName / TeamName 의 NAME_REGEX 와 동치 (문자/기호/공백 허용, 제어문자 등 제외)
const NAME_REGEX = /^[\p{L}\p{M}\p{N}\p{P}\p{Z}\s]+$/u;

/**
 * 필드별 검증 결과. null 이면 정상.
 * 붉은 테두리는 null 여부만으로 판단하고, 사유(LENGTH/FORM)는 추후 회복 메시지 노출에 재사용한다.
 */
export type FieldError = null | 'LENGTH' | 'FORM';

export const validateTableName = (value: string): FieldError => {
  const v = value ?? '';
  // 빈 값은 제출 시 기본값('시간표 1')으로 대체되므로 입력 중 에러로 보지 않는다.
  if (v.length === 0) return null;
  if (v.length > TABLE_FIELD_LIMITS.name) return 'LENGTH';
  if (!NAME_REGEX.test(v)) return 'FORM';
  return null;
};

export const validateTeamName = (value: string): FieldError => {
  const v = value ?? '';
  // 빈 값은 제출 시 기본값('찬성'/'반대')으로 대체되므로 입력 중 에러로 보지 않는다.
  if (v.length === 0) return null;
  if (v.length > TABLE_FIELD_LIMITS.teamName) return 'LENGTH';
  if (!NAME_REGEX.test(v)) return 'FORM';
  return null;
};

export const validateAgenda = (value: string): FieldError => {
  const v = value ?? '';
  if (v.length > TABLE_FIELD_LIMITS.agenda) return 'LENGTH';
  return null;
};

export const validateSpeechType = (value: string): FieldError => {
  const v = value ?? '';
  if (v.length > TABLE_FIELD_LIMITS.speechType) return 'LENGTH';
  return null;
};

export const validateSpeaker = (value: string): FieldError => {
  const v = value ?? '';
  if (v.trim().length > TABLE_FIELD_LIMITS.speaker) return 'LENGTH';
  return null;
};

/**
 * 필드 사유(FieldError)를 사용자 노출 메시지로 변환한다.
 * 입력창 아래 인라인 노출과 제출 차단이 동일 매핑을 공유하도록 헬퍼로 둔다.
 */
export const getTableNameErrorMessage = (
  reason: FieldError,
  t: TFunction,
): string | null => {
  if (reason === 'LENGTH')
    return t('시간표 이름은 최대 {{val0}}자까지 입력할 수 있습니다.', {
      val0: TABLE_FIELD_LIMITS.name,
    });
  if (reason === 'FORM')
    return t('시간표 이름에 사용할 수 없는 문자가 포함되어 있습니다.');
  return null;
};

export const getAgendaErrorMessage = (
  reason: FieldError,
  t: TFunction,
): string | null => {
  if (reason === 'LENGTH')
    return t('토론 주제는 최대 {{val0}}자까지 입력할 수 있습니다.', {
      val0: TABLE_FIELD_LIMITS.agenda,
    });
  return null;
};

export const getTeamNameErrorMessage = (
  reason: FieldError,
  t: TFunction,
): string | null => {
  if (reason === 'LENGTH') return t('팀명은 최대 15자까지 입력할 수 있습니다.');
  if (reason === 'FORM')
    return t('팀명에 사용할 수 없는 문자가 포함되어 있습니다.');
  return null;
};
