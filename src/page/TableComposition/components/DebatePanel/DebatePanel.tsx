import { HTMLAttributes } from 'react';
import EditDeleteButtons from '../EditDeleteButtons/EditDeleteButtons';
import {
  ParliamentaryTimeBoxInfo,
  DebateTypeToString,
} from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import { LuArrowUpDown } from 'react-icons/lu';
interface DebatePanelProps extends HTMLAttributes<HTMLDivElement> {
  info: ParliamentaryTimeBoxInfo;
  onSubmitEdit?: (updatedInfo: ParliamentaryTimeBoxInfo) => void;
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
      } h-20 select-none p-2 font-bold text-neutral-0`}
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
      <div className="font-semibold">
        {debateTypeLabel} {speakerNumber && `| ${speakerNumber}번 토론자`}
      </div>
      <div className="text-2xl font-semibold">{timeStr}</div>
    </div>
  );

  const renderNeutralTimeoutPanel = () => (
    <div className="relative flex h-20 w-full flex-col items-center justify-center rounded-md bg-neutral-500 p-2 font-medium ">
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
      <span className="font-semibold">{debateTypeLabel}</span>
      <span className="text-2xl font-semibold">{timeStr}</span>
    </div>
  );

  return (
    <div className={`flex w-full items-center ${containerClass}`}>
      {(isPros || isCons) && renderProsConsPanel()}

      {isNeutralTimeout && renderNeutralTimeoutPanel()}
    </div>
  );
}
