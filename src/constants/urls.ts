export const LANDING_URLS = {
  REPORT_FORM_URL: 'https://forms.gle/r9idqUGsoD2jJMZ29',
  PRIVACY_POLICY_URL:
    'https://bustling-bathtub-b3a.notion.site/2071550c60cf80f18395e03440fba80a?source=copy_link',
  TERMS_OF_SERVICE_URL:
    'https://bustling-bathtub-b3a.notion.site/1b01550c60cf8020b34adff2d40cf605?source=copy_link',
  TEMPLATE_REGISTER_URL: 'https://forms.gle/471ojcPqSdkWqVCaA',
} as const;

export const INQUIRY_LINKS = [
  { label: '일반 문의', url: import.meta.env.VITE_GENERAL_INQUIRY_URL?.trim() },
  {
    label: '템플릿 추가 요청',
    url: import.meta.env.VITE_TEMPLATE_REQUEST_URL?.trim(),
  },
  {
    label: '단체/제휴 문의',
    url: import.meta.env.VITE_PARTNERSHIP_INQUIRY_URL?.trim(),
  },
].filter((item): item is { label: string; url: string } => !!item.url);
