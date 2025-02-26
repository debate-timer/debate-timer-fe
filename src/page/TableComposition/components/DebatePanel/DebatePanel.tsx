import { HTMLAttributes } from 'react';
import EditDeleteButtons from '../EditDeleteButtons/EditDeleteButtons';
import { TimeBoxInfo, DebateTypeToString } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import { LuArrowUpDown } from 'react-icons/lu';
interface DebatePanelProps extends HTMLAttributes<HTMLDivElement> {
  info: TimeBoxInfo;
  onSubmitEdit?: (updatedInfo: TimeBoxInfo) => void;
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
      className={`${isPros ? 'right-2' : 'left-2'} absolute top-4 flex h-2/3 w-4 flex-1 cursor-grab items-center 
                justify-center rounded-md bg-neutral-0 hover:bg-neutral-300`}
      onMouseDown={onMouseDown}
      title="위아래로 드래그"
    >
      <LuArrowUpDown className="text-neutral-900" />
    </div>
  );
  const renderProsConsPanel = () => (
    <div
      className={`relative flex w-1/2 flex-col items-center justify-center rounded-md ${
        isPros ? 'bg-camp-blue' : 'bg-camp-red'
      } h-24 select-none p-2 font-bold text-neutral-0`}
    >
      {onSubmitEdit && onSubmitDelete && (
        <>
          {isPros ? (
            <>
              <div className="absolute left-2 top-2">
                <EditDeleteButtons
                  info={props.info}
                  onSubmitEdit={onSubmitEdit}
                  onSubmitDelete={onSubmitDelete}
                />
              </div>
              {renderDragHandle()}
            </>
          ) : (
            <>
              {renderDragHandle()}
              <div className="absolute right-2 top-2">
                <EditDeleteButtons
                  info={props.info}
                  onSubmitEdit={onSubmitEdit}
                  onSubmitDelete={onSubmitDelete}
                />
              </div>
            </>
          )}
        </>
      )}
      <div>
        {debateTypeLabel} | {speakerNumber}번 토론자
      </div>
      <div className="text-2xl">{timeStr}</div>
    </div>
  );

  const renderNeutralTimeoutPanel = () => (
    <div className="relative flex h-24 w-full select-none items-center text-center">
      <div className="relative flex h-4/5 w-full flex-col items-center justify-center rounded-md bg-neutral-500 p-2 font-medium ">
        {onSubmitEdit && onSubmitDelete && (
          <>
            {renderDragHandle()}
            <div className="absolute right-2 top-2">
              <EditDeleteButtons
                info={props.info}
                onSubmitEdit={onSubmitEdit}
                onSubmitDelete={onSubmitDelete}
              />
            </div>
          </>
        )}
        <span className="text-sm">{debateTypeLabel}</span>
        <span className="text-xl">{timeStr}</span>
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
