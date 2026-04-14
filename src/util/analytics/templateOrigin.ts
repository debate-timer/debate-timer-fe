interface TemplateOriginData {
  organization_name: string;
  template_name: string;
  template_label: string;
}

/** 템플릿 출처 정보를 세션 스토리지에 저장할 때 사용하는 키다. */
const STORAGE_KEY = 'analytics_template_origin';

/**
 * 선택한 템플릿의 출처 정보를 세션 스토리지에 저장한다.
 * `data`는 조직명, 템플릿명, 표시 라벨을 담은 객체이며 반환값은 없다.
 */
export function setTemplateOrigin(data: TemplateOriginData): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 저장된 템플릿 출처 정보를 한 번만 읽고 삭제한다.
 * 파라미터는 받지 않으며, 저장값이 유효하면 출처 객체를, 없거나 파싱에 실패하면 `null`을 반환한다.
 */
export function consumeTemplateOrigin(): TemplateOriginData | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * 세션 스토리지에 남아 있는 템플릿 출처 정보를 삭제한다.
 * 파라미터는 받지 않으며, 반환값은 없다.
 */
export function clearTemplateOrigin(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
