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
      className="flex h-[72px] w-[492px] items-center justify-center gap-[12px] rounded-full border-[2px] border-default-disabled/hover bg-default-white px-[16px] py-[11px] font-semibold text-default-black opacity-80 transition-colors duration-200 hover:bg-default-disabled/hover"
    >
      <span>홈으로 돌아가기 →</span>
    </button>
  );
}
