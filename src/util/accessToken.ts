export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
  window.dispatchEvent(new Event('auth-changed'));
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
  window.dispatchEvent(new Event('auth-changed'));
};

export const isLoggedIn = (): boolean => {
  return !!getAccessToken();
};

export const setMemberId = (id: number): void => {
  localStorage.setItem('memberId', String(id));
  window.dispatchEvent(new Event('auth-changed'));
};

export const getMemberId = (): string | null => {
  return localStorage.getItem('memberId');
};

export const removeMemberId = (): void => {
  localStorage.removeItem('memberId');
  window.dispatchEvent(new Event('auth-changed'));
};

let lastIdentity: string | null = null;
let identityRevision = 0;
/** 같은 계정의 토큰 갱신과 계정 재진입을 구분함. */
export function getAuthRevision(): number {
  let identity: string | null = null;
  try {
    identity = getAccessToken() ? getMemberId() : null;
  } catch {
    /* 저장소 차단 시 비회원으로 처리함. */
  }
  if (identity !== lastIdentity) {
    lastIdentity = identity;
    identityRevision += 1;
  }
  return identityRevision;
}
if (typeof window !== 'undefined') {
  window.addEventListener('auth-changed', getAuthRevision);
  window.addEventListener('storage', getAuthRevision);
}
