import { DebateTable } from '../../types/type';
import { FeatureFlag } from '../../types/featureFlag';
import { SupportedLang } from '../../util/languageRouting';

// GET /api/member/settings
export interface GetMemberSettingsResponseType {
  language: SupportedLang | null;
  volume: number;
}

// PATCH /api/member/settings
export interface PatchMemberSettingsResponseType {
  language: SupportedLang | null;
  volume: number;
}

// POST "/api/member"
export interface PostUserResponseType {
  id: number;
  email: string;
}

// GET /api/table
export interface GetDebateTableListResponseType {
  tables: DebateTable[];
}

// GET /api/member/feature-flags
export interface GetMemberFeatureFlagsResponseType {
  featureFlags: FeatureFlag[];
}
