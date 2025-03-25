import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

type PrevNextButtonTypes = 'PREV' | 'NEXT';

interface PrevNextButtonProps {
  type: PrevNextButtonTypes;
  onClick: () => void;
}

export default function PrevNextButton({ type, onClick }: PrevNextButtonProps) {
  return (
    <button
      className="flex h-[68px] w-[200px] flex-row items-center justify-center space-x-2 rounded-full border border-neutral-300 bg-neutral-200 hover:bg-brand-main"
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
    </button>
  );
}
