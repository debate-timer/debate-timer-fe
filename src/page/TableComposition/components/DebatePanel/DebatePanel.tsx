import { HTMLAttributes } from 'react';
import EditDeleteButtons from '../EditDeleteButtons/EditDeleteButtons';
import { DebateInfo, DebateTypeToString } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import { LuArrowUpDown } from 'react-icons/lu';
interface DebatePanelProps extends HTMLAttributes<HTMLDivElement> {
  info: DebateInfo;
  onSubmitEdit?: (updatedInfo: DebateInfo) => void;
  onSubmitDelete?: () => void;
}

export default function DebatePanel(props: DebatePanelProps) {
  const { stance, type, time, speakerNumber } = props.info;
  const { onSubmitEdit, onSubmitDelete, onMouseDown } = props;

  const debateTypeLabel = DebateTypeToString[type];
  const { minutes, seconds } = Formatting.formatSecondsToMinutes(time);
  const timeStr = `${minutes}분 ${seconds}초`;

  const isPros = stance === 'PROS';
  const isCons = stance === 'CONS';
  const isNeutralTimeout = type === 'TIME_OUT' && stance === 'NEUTRAL';

  const containerClass = isPros
    ? 'justify-start'
    : isCons
      ? 'justify-end'
      : 'justify-center';

  const renderDragHandle = () => (
    <div
      className="left-0x absolute top-4 flex h-2/3 w-4 flex-1 cursor-grab items-center 
                justify-center rounded-md bg-slate-100 "
      onMouseDown={onMouseDown}
      title="위아래로 드래그"
    >
      {/* 세로줄 아이콘을 중앙에 표시해줍니다 */}
      <LuArrowUpDown className="text-gray-600" />
    </div>
  );
  const renderProsConsPanel = () => (
    <div
      className={`flex w-1/2 flex-col items-center rounded-md ${
        isPros ? 'bg-blue-500' : 'bg-red-500'
      } h-24 select-none p-2 font-bold text-white`}
    >
      {onSubmitEdit && onSubmitDelete && (
        <div className="flex h-4 w-full items-center gap-2">
          <div className="flex-1" />
          {renderDragHandle()}
          <div className="flex-1">
            <EditDeleteButtons
              info={props.info}
              onSubmitEdit={onSubmitEdit}
              onSubmitDelete={onSubmitDelete}
            />
          </div>
        </div>
      )}
      <div>
        {debateTypeLabel} / {speakerNumber}번 토론자
      </div>
      <div className="text-2xl">{timeStr}</div>
    </div>
  );

  const renderNeutralTimeoutPanel = () => (
    <div className="flex h-24 w-full select-none items-center text-center">
      <div className="flex h-4/5 w-full flex-col items-center justify-start rounded-md bg-gray-200 p-2 font-medium text-gray-600">
        {onSubmitEdit && onSubmitDelete && (
          <div className="flex h-4 w-full items-center gap-2">
            <div className="flex-1" />
            {renderDragHandle()}
            <div className="flex-1">
              <EditDeleteButtons
                info={props.info}
                onSubmitEdit={onSubmitEdit}
                onSubmitDelete={onSubmitDelete}
              />
            </div>
          </div>
        )}
        {debateTypeLabel} | {timeStr}
      </div>
    </div>
  );

  return (
    <div className={`flex w-full items-center ${containerClass}`}>
      {(isPros || isCons) && renderProsConsPanel()}

      {isNeutralTimeout && renderNeutralTimeoutPanel()}
    </div>
  );
}
