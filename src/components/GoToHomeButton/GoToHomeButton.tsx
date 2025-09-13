import { useNavigate } from 'react-router-dom';

export default function GoToHomeButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  // "flex h-[72px] w-[492px] items-center justify-center gap-[12px] rounded-full border-[2px] border-default-disabled/hover bg-default-white px-[16px] py-[11px] font-semibold text-default-black opacity-80 transition-colors duration-200 hover:bg-default-disabled/hover"
  return (
    <button
      type="button"
      aria-label="홈으로 돌아가기"
      onClick={handleClick}
      className="button enabled neutral flex w-[492px] flex-row space-x-[12px] rounded-full p-[24px]"
    >
      <h1>홈으로 돌아가기 →</h1>
    </button>
  );
}
