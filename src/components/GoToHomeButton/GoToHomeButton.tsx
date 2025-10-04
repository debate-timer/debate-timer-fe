import { useNavigate } from 'react-router-dom';

export default function GoToHomeButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      type="button"
      aria-label="홈으로 돌아가기"
      onClick={handleClick}
      className="button enabled neutral flex w-[492px] flex-row space-x-[12px] rounded-full p-[24px]"
    >
      홈으로 돌아가기 →
    </button>
  );
}
