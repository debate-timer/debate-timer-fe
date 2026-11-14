import { matchPath } from 'react-router-dom';
import { buildLangPath } from './languageRouting';

export interface AudienceTermination {
  tableId: number;
  reason: 'ABORT' | 'FINISHED';
}

export interface LoginReturn {
  path: string;
  termination?: AudienceTermination;
}

const STORAGE_KEY = 'login-return';
const RETURN_ROUTES = [
  '/',
  '/home',
  '/dashboard',
  '/records',
  '/templates',
  '/composition',
  '/share',
  '/overview/:type/:id',
  '/table/customize/:id',
  '/table/customize/:id/end',
  '/table/customize/:id/end/feedback',
  '/table/customize/:tableId/end/vote/:pollId',
  '/table/customize/:tableId/end/vote/:pollId/result',
  '/table/customize/:tableId/end/transcript/:transcriptId',
  '/transcript/shared/:shareToken',
  '/vote/:id',
  '/live/:id',
  '/live/:id/end',
];

/** 외부 상태는 실제 라이브 종료 경로와 같은 ID의 수신 사유만 허용함. */
export function getAudienceTermination(
  value: unknown,
  tableId: number,
): AudienceTermination | undefined {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('tableId' in value) ||
    !('reason' in value)
  ) {
    return undefined;
  }
  if (
    value.tableId !== tableId ||
    !Number.isSafeInteger(tableId) ||
    tableId <= 0 ||
    (value.reason !== 'ABORT' && value.reason !== 'FINISHED')
  ) {
    return undefined;
  }
  return { tableId, reason: value.reason };
}

/** 앱의 허용 경로와 최소 종료 문맥만 복제하며 임의 history state는 저장하지 않음. */
export function validateLoginReturn(value: unknown): LoginReturn | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('path' in value) ||
    typeof value.path !== 'string'
  ) {
    return null;
  }
  const path = value.path;
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /[\\\s]|%2f|%5c|%00/i.test(path) ||
    Array.from(path).some((character) => character.charCodeAt(0) < 32)
  ) {
    return null;
  }
  const url = new URL(path, 'https://debate-timer.invalid');
  const pathname = buildLangPath(url.pathname, 'ko');
  if (!RETURN_ROUTES.some((pattern) => matchPath(pattern, pathname))) {
    return null;
  }
  const result: LoginReturn = { path };
  const ended = matchPath('/live/:id/end', pathname);
  const termination = getAudienceTermination(
    'termination' in value ? value.termination : undefined,
    Number(ended?.params.id),
  );
  if (termination) {
    result.termination = termination;
  }
  return result;
}

export function saveLoginReturn(value: LoginReturn): void {
  try {
    const destination = validateLoginReturn(value);
    sessionStorage.removeItem(STORAGE_KEY);
    if (destination) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(destination));
    }
  } catch {
    // 저장소를 사용할 수 없으면 OAuth의 기본 목적지를 사용함.
  }
}

export function consumeLoginReturn(): LoginReturn | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return raw ? validateLoginReturn(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
