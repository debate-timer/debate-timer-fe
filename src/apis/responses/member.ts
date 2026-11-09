import { DebateTable } from '../../types/type';
import { FeatureFlag } from '../../types/featureFlag';

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
