/**
 * JWT의 만료 시각(`exp`)을 epoch ms로 반환합니다.
 * 서명은 검증하지 않으며, 형식이 올바르지 않거나 `exp`가 없으면 `null`을 반환합니다.
 */
export function getJwtExpiresAt(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const { exp } = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null;
  } catch {
    return null;
  }
}
