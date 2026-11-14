/** 공개 링크의 호스트와 SPA basename을 한 번씩 조합함. */
export function buildPublicUrl(path: string): string {
  const host = (
    import.meta.env.VITE_SHARE_BASE_URL || window.location.origin
  ).replace(/\/+$/, '');
  const base = (import.meta.env.VITE_BASE_PATH || '').replace(/^\/+|\/+$/g, '');
  return `${host}${base ? `/${base}` : ''}${path}`;
}
