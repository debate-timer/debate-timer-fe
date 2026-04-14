import { useEffect, useRef } from 'react';
import { useLocation, useMatches } from 'react-router-dom';
import { analyticsManager } from '../util/analytics';

function normalizePath(pathname: string, params: Readonly<Record<string, string | undefined>>): string {
  let normalized = pathname;
  // 긴 값부터 치환해야 짧은 값이 긴 값의 일부를 덮어쓰는 것을 방지
  const entries = Object.entries(params)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .sort(([, a], [, b]) => b.length - a.length);
  for (const [key, value] of entries) {
    normalized = normalized.split(`/${value}`).join(`/:${key}`);
  }
  return normalized;
}

export default function usePageTracking() {
  const location = useLocation();
  const matches = useMatches();
  const entryTimeRef = useRef<number>(Date.now());
  const previousPathRef = useRef<string>('');

  const lastMatch = matches[matches.length - 1];
  const normalizedPath = normalizePath(location.pathname, lastMatch?.params ?? {});
  const normalizedPathRef = useRef(normalizedPath);
  normalizedPathRef.current = normalizedPath;

  useEffect(() => {
    const currentPath = normalizedPathRef.current;

    // 새 페이지 page_view 발화
    analyticsManager.trackPageView({
      page_title: document.title,
      previous_page_path: previousPathRef.current,
      referrer: document.referrer,
    });

    // 진입 시각 및 이전 경로 갱신
    entryTimeRef.current = Date.now();
    previousPathRef.current = currentPath;

    // 언마운트 또는 경로 변경 시 page_leave 발화 (1회만)
    return () => {
      const duration = Date.now() - entryTimeRef.current;
      analyticsManager.trackEvent('page_leave', {
        page_title: document.title,
        page_path: previousPathRef.current,
        duration_ms: duration,
      });
    };
  }, [location.pathname]);

  // pagehide/beforeunload 시 마지막 페이지 page_leave + flush
  useEffect(() => {
    function handlePageHide() {
      const duration = Date.now() - entryTimeRef.current;
      analyticsManager.trackEvent('page_leave', {
        page_title: document.title,
        page_path: previousPathRef.current,
        duration_ms: duration,
      });
      analyticsManager.flush();
    }

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, []);
}
