import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

interface GoToDebateEndButtonProps {
  tableId: number;
  className?: string;
}

export default function GoToDebateEndButton({
  tableId,
  className = '',
}: GoToDebateEndButtonProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const handleClick = (tableId: number) => {
    const currentLang = i18n.resolvedLanguage ?? i18n.language;
    const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
    navigate(buildLangPath(`/table/customize/${tableId}/end`, lang));
  };

  return (
    <button
      type="button"
      aria-label={t('토론 종료 화면으로 돌아가기')}
      onClick={() => handleClick(tableId)}
      className={clsx(
        'button enabled neutral flex flex-row rounded-full p-[24px]',
        className,
      )}
    >
      {t('토론 종료 화면으로 돌아가기')}
    </button>
  );
}
