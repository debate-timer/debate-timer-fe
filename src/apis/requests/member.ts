import { SupportedLang } from '../../util/languageRouting';

// PATCH /api/member/settings: 최소 한 필드는 직접 선택한 값이어야 함.
export type PatchMemberSettingsRequestType =
  | { language: SupportedLang; volume?: number }
  | { language?: SupportedLang; volume: number };
