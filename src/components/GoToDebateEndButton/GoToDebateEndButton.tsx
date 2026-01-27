import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

interface GoToDebateEndButtonProps {
  tableId: number;
  className?: string;
}

export default function GoToDebateEndButton({
  tableId,
  className = '',
}: GoToDebateEndButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleClick = (tableId: number) => {
    navigate(`/table/customize/${tableId}/end`);
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
      {t('뒤로 가기 ←')}
    </button>
  );
}
