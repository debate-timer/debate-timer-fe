import { SupportedLang } from '../../util/languageRouting';

// PATCH /api/member/settings: null은 기존 값 유지이며 최소 한 필드는 변경값이어야 함.
export type PatchMemberSettingsRequestType =
  | { language: SupportedLang; volume?: number | null }
  | { language?: SupportedLang | null; volume: number };
