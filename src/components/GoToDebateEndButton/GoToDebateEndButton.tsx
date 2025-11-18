import { useNavigate } from 'react-router-dom';

interface GoToDebateEndButtonProps {
  tableId: number;
}

export default function GoToDebateEndButton({
  tableId,
}: GoToDebateEndButtonProps) {
  const navigate = useNavigate();
  const handleClick = (tableId: number) => {
    navigate(`/table/customize/${tableId}/end`);
  };

  return (
    <button
      type="button"
      aria-label="토론 종료 화면으로 돌아가기"
      onClick={() => handleClick(tableId)}
      className="button enabled neutral flex w-[492px] flex-row space-x-2 rounded-full p-[24px]"
    >
      토론 종료 화면으로 돌아가기 →
    </button>
  );
}
