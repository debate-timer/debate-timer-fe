import { matchPath } from 'react-router-dom';
import { buildLangPath, getLangFromPath } from './languageRouting';

export type HeaderRole = 'general' | 'timer' | 'audience';

export const SPECIAL_HEADER_ROUTES: { path: string; role: HeaderRole }[] = [
  { path: '/table/customize/:id', role: 'timer' },
  { path: '/table/customize/:id/end/feedback', role: 'timer' },
  { path: '/table/customize/:tableId/end/vote/:pollId', role: 'timer' },
  { path: '/live/:id', role: 'audience' },
  { path: '/live/:id/end', role: 'audience' },
  { path: '/vote/:id', role: 'audience' },
];

/** 경로 선언과 오류 화면에서 같은 헤더 역할을 사용함. */
export function getHeaderRole(pathname: string): HeaderRole {
  const path = buildLangPath(pathname, 'ko');
  return (
    SPECIAL_HEADER_ROUTES.find((route) => matchPath(route.path, path))?.role ??
    'general'
  );
}

/** 이전 링크에서 소비한 tab만 제거하고 언어·나머지 query·hash를 보존함. */
export function getCompatibilityDestination(source: string): string | null {
  const url = new URL(source, 'https://debate-timer.invalid');
  const lang = getLangFromPath(url.pathname) ?? 'ko';
  const path = buildLangPath(url.pathname, 'ko');
  if (
    ['/', '/dashboard'].includes(path) &&
    url.searchParams.get('tab') === 'records'
  ) {
    url.searchParams.delete('tab');
    return `${buildLangPath('/records', lang)}${url.search}${url.hash}`;
  }
  if (path === '/home') {
    return `${buildLangPath('/', lang)}${url.search}${url.hash}`;
  }
  return null;
}

export function parsePositiveId(
  value: string | null | undefined,
): number | undefined {
  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}
