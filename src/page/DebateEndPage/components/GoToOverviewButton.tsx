import { TbCalendarTime } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

interface GoToOverviewButtonProps {
  tableId: number;
}

export default function GoToOverviewButton({
  tableId,
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
      className="button enabled neutral flex w-[492px] flex-row space-x-2 rounded-full p-[24px]"
    >
      <TbCalendarTime className="aspect-square h-full" />
      <p>시간표로 돌아가기</p>
    </button>
  );
}
