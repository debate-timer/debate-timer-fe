import { useTranslation } from 'react-i18next';
import { LANDING_URLS } from '../../../constants/urls';

const FOOTER_LINKS = [
  { label: '개인정보처리방침', href: LANDING_URLS.PRIVACY_POLICY_URL },
  { label: '서비스 이용약관', href: LANDING_URLS.TERMS_OF_SERVICE_URL },
  // TODO: 헤더 '문의' 메뉴가 반영되면 제보 링크를 푸터에서 제거함.
  { label: '버그 및 불편사항 제보', href: LANDING_URLS.REPORT_FORM_URL },
] as const;

export default function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="flex w-full justify-center border-t border-neutral-200 px-4 py-10">
      <div className="flex w-full max-w-[1200px] flex-col gap-2.5">
        <p className="text-ui-label">Debate Timer</p>
        <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ui-caption text-neutral-500">
          {FOOTER_LINKS.map((link, index) => (
            <li key={link.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">|</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900"
              >
                {t(link.label)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
