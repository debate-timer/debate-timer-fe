import clsx from 'clsx';
import RoundControlButton from '../../../components/RoundControlButton/RoundControlButton';
import { TimeBoxInfo } from '../../../type/type';
import { SocketEventType } from '../../../apis/sockets/type';
import useThrottle from '../../../hooks/useThrottle';

/**
 * 차례 이동/종료 버튼을 한 번 누른 뒤 다시 누를 수 없는 시간 (ms)
 * - 더블클릭이 순서를 두 번 넘기거나, 마지막 직전 차례에서 같은 자리의 토론 종료 버튼까지 누르는 것을 막는다
 */
export const ROUND_CONTROL_COOLDOWN_MS = 500;

interface RoundControlRowProps {
  table: TimeBoxInfo[];
  index: number;
  goToOtherItem: (isPrev: boolean) => void;
  openDoneModal: () => void;
  onEvent: (invoke: () => void, eventType: SocketEventType) => void;
  className?: string;
}

export default function RoundControlRow(props: RoundControlRowProps) {
  const {
    table,
    index,
    goToOtherItem,
    openDoneModal,
    onEvent,
    className = '',
  } = props;

  // 세 버튼이 한 대기 시간을 공유해야 NEXT 직후 같은 자리에 나타난 DONE 클릭도 막힌다
  const handleRoundControl = useThrottle(onEvent, ROUND_CONTROL_COOLDOWN_MS);

  return (
    <div className={clsx('flex flex-row space-x-1 xl:space-x-8', className)}>
      <div className="flex w-[175px] items-center justify-center xl:w-[200px]">
        {index !== 0 && (
          <RoundControlButton
            type="PREV"
            onClick={() =>
              handleRoundControl(() => goToOtherItem(true), 'BEFORE')
            }
          />
        )}
      </div>
      <div className="flex w-[175px] items-center justify-center xl:w-[200px]">
        {index === table.length - 1 ? (
          <RoundControlButton
            type="DONE"
            onClick={() => handleRoundControl(openDoneModal, 'FINISHED')}
          />
        ) : (
          <RoundControlButton
            type="NEXT"
            onClick={() =>
              handleRoundControl(() => goToOtherItem(false), 'NEXT')
            }
          />
        )}
      </div>
    </div>
  );
}
