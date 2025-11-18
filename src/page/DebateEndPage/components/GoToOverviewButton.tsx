import clsx from 'clsx';
import { TbCalendarTime } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

interface GoToOverviewButtonProps {
  tableId: number;
  className?: string;
}

export default function GoToOverviewButton({
  tableId,
  className = '',
}: GoToOverviewButtonProps) {
  const navigate = useNavigate();
  const handleClick = (tableId: number) => {
    navigate(`/overview/customize/${tableId}`);
  };

  return (
    <button
      type="button"
      aria-label="시간표로 돌아가기"
      onClick={() => handleClick(tableId)}
      className={clsx(
        'button enabled neutral flex flex-row space-x-2 rounded-full p-[24px]',
        className,
      )}
    >
      <TbCalendarTime className="aspect-square h-full" />
      <p>시간표로 돌아가기</p>
    </button>
  );
}
