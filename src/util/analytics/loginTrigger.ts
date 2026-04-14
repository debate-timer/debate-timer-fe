interface LoginTriggerData {
  trigger_page: string;
  trigger_context:
    | 'landing_header'
    | 'landing_table_section'
    | 'share_save'
    | 'timer_modal'
    | 'protected_route';
}

interface StoredLoginTrigger extends LoginTriggerData {
  timestamp: number;
}

/** 로그인 진입 맥락을 세션 스토리지에 저장할 때 사용하는 키다. */
const STORAGE_KEY = 'analytics_login_trigger';
/** 저장된 로그인 진입 맥락을 유효하다고 보는 최대 유지 시간이다. */
const EXPIRY_MS = 5 * 60 * 1000; // 5분

/**
 * 로그인 시작 위치와 맥락을 세션 스토리지에 저장한다.
 * `data`는 진입 페이지와 컨텍스트, `options.force`는 기존 값이 있어도 덮어쓸지 여부이며 반환값은 없다.
 */
export function setLoginTrigger(
  data: LoginTriggerData,
  options?: { force?: boolean },
): void {
  if (!options?.force && hasLoginTrigger()) {
    return;
  }
  const stored: StoredLoginTrigger = { ...data, timestamp: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/**
 * 저장된 로그인 진입 정보를 읽고 삭제한다.
 * 파라미터는 받지 않으며, 유효한 저장값이면 로그인 진입 정보 객체를, 없거나 만료/파싱 실패 시 `null`을 반환한다.
 */
export function consumeLoginTrigger(): LoginTriggerData | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    const stored: StoredLoginTrigger = JSON.parse(raw);
    if (Date.now() - stored.timestamp > EXPIRY_MS) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timestamp, ...data } = stored;
    return data;
  } catch {
    return null;
  }
}

/**
 * 저장된 로그인 진입 정보를 삭제한다.
 * 파라미터는 받지 않으며, 반환값은 없다.
 */
export function clearLoginTrigger(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * 현재 로그인 진입 정보가 저장되어 있는지 확인한다.
 * 파라미터는 받지 않으며, 저장값 존재 여부를 불리언으로 반환한다.
 */
export function hasLoginTrigger(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}
