import { DebateInfo } from '../../../../type/type';
import AdditionalTimerSummaryItem from './AdditionalTimerSummaryItem';

type SummaryItemType = 'PREV' | 'CURR' | 'NEXT';

const SummaryItemTypeToString: Record<SummaryItemType, string> = {
  PREV: '이전 순서',
  CURR: '현재 순서',
  NEXT: '다음 순서',
};

interface AdditionalTimerSummaryProps {
  prevItem?: DebateInfo;
  currItem: DebateInfo;
  nextItem?: DebateInfo;
}

export default function AdditionalTimerSummary({
  prevItem,
  currItem,
  nextItem,
}: AdditionalTimerSummaryProps) {
  return (
    <div className="flex h-full flex-row items-start space-x-4">
      <div className="flex flex-1 flex-col items-center space-y-2">
        {/* Text that displays item's sequence */}
        <h1 className="font-bold ">{SummaryItemTypeToString['PREV']}</h1>

        {prevItem !== undefined && (
          <AdditionalTimerSummaryItem item={prevItem} />
        )}
        {prevItem === undefined && <div className="w-[150px]"></div>}
      </div>

      <div className="flex flex-1 flex-col items-center space-y-2">
        {/* Text that displays item's sequence */}
        <h1 className="font-bold ">{SummaryItemTypeToString['CURR']}</h1>
        <AdditionalTimerSummaryItem item={currItem} />
      </div>

      <div className="flex flex-1 flex-col items-center space-y-2">
        {/* Text that displays item's sequence */}
        <h1 className="font-bold ">{SummaryItemTypeToString['NEXT']}</h1>

        {nextItem !== undefined && (
          <AdditionalTimerSummaryItem item={nextItem} />
        )}
        {nextItem === undefined && <div className="w-[150px]"></div>}
      </div>
    </div>
  );
}
