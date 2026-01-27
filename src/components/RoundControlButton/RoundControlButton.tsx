import { useTranslation } from 'react-i18next';
import DTLeftArrow from '../icons/LeftArrow';
import DTRightArrow from '../icons/RightArrow';

type RoundControlButtonTypes = 'PREV' | 'NEXT' | 'DONE';

interface RoundControlButtonProps {
  type: RoundControlButtonTypes;
  onClick: () => void;
}

export default function RoundControlButton({
  type,
  onClick,
}: RoundControlButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      className="flex h-[50px] w-[150px] flex-row items-center justify-center space-x-2 rounded-full border-[1px] border-neutral-300 bg-neutral-200 hover:bg-brand lg:h-[60px] lg:w-[170px] xl:h-[68px] xl:w-[200px]"
      onClick={() => onClick()}
    >
      {type === 'PREV' && (
        <>
          <DTLeftArrow className="size-[25px] lg:size-[31px] xl:size-[36px]" />
          <h1 className="text-[21px] font-semibold lg:text-[24px] xl:text-[28px]">
            {t('이전 차례')}
          </h1>
        </>
      )}
      {type === 'NEXT' && (
        <>
          <h1 className="text-[21px] font-semibold lg:text-[24px] xl:text-[28px]">
            {t('다음 차례')}
          </h1>
          <DTRightArrow className="size-[25px] lg:size-[31px] xl:size-[36px]" />
        </>
      )}
      {type === 'DONE' && (
        <h1 className="text-[21px] font-semibold lg:text-[24px] xl:text-[28px]">
          {t('토론 종료')}
        </h1>
      )}
    </button>
  );
}
