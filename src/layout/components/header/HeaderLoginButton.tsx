import { IoLogInSharp } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

interface HeaderLoginButtonProps {
  onClick: () => void;
}

const BUTTON_CLASS =
  'flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2 md:size-auto md:min-h-11 md:px-4';

/** 데스크톱에서는 '로그인' 문구를, 모바일에서는 로그인 아이콘을 표시하는 헤더 로그인 버튼임. */
export default function HeaderLoginButton(props: HeaderLoginButtonProps) {
  const { onClick } = props;
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-label={t('로그인')}
      className={BUTTON_CLASS}
      onClick={onClick}
    >
      <IoLogInSharp className="size-6 md:hidden" aria-hidden="true" />
      <span className="hidden md:inline">{t('로그인')}</span>
    </button>
  );
}
