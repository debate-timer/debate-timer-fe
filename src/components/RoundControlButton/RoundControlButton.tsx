import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

type RoundControlButtonTypes = 'PREV' | 'NEXT' | 'DONE';

interface RoundControlButtonProps {
  type: RoundControlButtonTypes;
  onClick: () => void;
}

export default function RoundControlButton({
  type,
  onClick,
}: RoundControlButtonProps) {
  return (
    <button
      className="flex h-[68px] w-[200px] flex-row items-center justify-center space-x-2 rounded-full border-[1px] border-neutral-300 bg-neutral-200 shadow-lg hover:bg-brand-main"
      onClick={() => onClick()}
    >
      {type === 'PREV' && (
        <>
          <FaArrowLeft className="size-[36px]" />
          <h1 className="text-[28px] font-semibold">이전 차례</h1>
        </>
      )}
      {type === 'NEXT' && (
        <>
          <h1 className="text-[28px] font-semibold">다음 차례</h1>
          <FaArrowRight className="size-[36px]" />
        </>
      )}
      {type === 'DONE' && (
        <h1 className="text-[28px] font-semibold">토론 종료</h1>
      )}
    </button>
  );
}
