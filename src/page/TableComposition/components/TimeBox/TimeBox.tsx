import { HTMLAttributes } from 'react';
import TimeBoxManageButtons from '../TimeBoxManageButtons/TimeBoxManageButtons';
import { TimeBoxInfo } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import DTDrag from '../../../../components/icons/Drag';
import SmallIconContainer from '../../../../components/SmallIconContainer/SmallIconContainer';

interface TimeBoxEventHandlers {
  onSubmitEdit?: (updatedInfo: TimeBoxInfo) => void;
  onSubmitDelete?: () => void;
  onSubmitCopy?: () => void;
  onMouseDown?: () => void;
}
interface TimeBoxProps extends HTMLAttributes<HTMLDivElement> {
  info: TimeBoxInfo;
  prosTeamName: string;
  consTeamName: string;
  eventHandlers?: TimeBoxEventHandlers;
}

export default function TimeBox(props: TimeBoxProps) {
  const {
    stance,
    speechType,
    boxType,
    time,
    timePerTeam,
    timePerSpeaking,
    speaker,
  } = props.info;
  const { eventHandlers } = props;
  const onSubmitEdit = eventHandlers?.onSubmitEdit;
  const onSubmitDelete = eventHandlers?.onSubmitDelete;
  const onSubmitCopy = eventHandlers?.onSubmitCopy;
  const onMouseDown = eventHandlers?.onMouseDown;
  const isModifiable = !!eventHandlers;
  let timeStr = '';
  let timePerSpeakingStr = '';

  if (boxType === 'NORMAL') {
    const { minutes, seconds } = Formatting.formatSecondsToMinutes(time!);
    timeStr = `${minutes}분 ${seconds}초`;
  } else {
    const { minutes, seconds } = Formatting.formatSecondsToMinutes(
      timePerTeam!,
    );
    timeStr = `팀당 ${minutes}분 ${seconds}초`;
  }

  if (timePerSpeaking !== null) {
    const { minutes, seconds } =
      Formatting.formatSecondsToMinutes(timePerSpeaking);
    timePerSpeakingStr = `발언당 ${minutes}분 ${seconds}초`;
  }
  const fullTimeStr = timePerSpeakingStr
    ? `${timeStr} | ${timePerSpeakingStr}`
    : timeStr;

  const isPros = stance === 'PROS';
  const isCons = stance === 'CONS';
  const isNeutralTimeout = boxType === 'NORMAL' && stance === 'NEUTRAL'; // 작전시간
  const isNeutralCustom = boxType === 'TIME_BASED' && stance === 'NEUTRAL'; // 자유토론타이머

  const containerClass = isPros
    ? 'justify-start'
    : isCons
      ? 'justify-end'
      : 'justify-center';

  const renderDragHandle = () => (
    <div
      className={`
        absolute flex cursor-grab items-center justify-center
        ${isPros ? 'right-[10px]' : 'left-[10px]'}
      `}
      onMouseDown={onMouseDown}
      title="위아래로 드래그"
    >
      <SmallIconContainer className="w-[28px] px-[4px] py-[8px]">
        <DTDrag />
      </SmallIconContainer>
    </div>
  );

  const renderProsConsPanel = () => (
    <div
      className={`
        timebox
        ${isPros ? 'pros' : 'cons'}
      `}
    >
      {isPros
        ? isModifiable && (
            <>
              <div className="absolute left-[10px] top-[10px]">
                <TimeBoxManageButtons
                  info={props.info}
                  prosTeamName={props.prosTeamName}
                  consTeamName={props.consTeamName}
                  eventHandlers={{
                    onSubmitEdit,
                    onSubmitDelete,
                    onSubmitCopy,
                  }}
                />
              </div>
              {renderDragHandle()}
            </>
          )
        : isModifiable && (
            <>
              {renderDragHandle()}
              <div className="absolute right-[10px] top-[10px]">
                <TimeBoxManageButtons
                  info={props.info}
                  prosTeamName={props.prosTeamName}
                  consTeamName={props.consTeamName}
                  eventHandlers={{
                    onSubmitEdit,
                    onSubmitDelete,
                    onSubmitCopy,
                  }}
                />
              </div>
            </>
          )}
      <p className="text-detail mb-2 text-default-white">
        {speechType} {speaker && `| ${speaker} 토론자`}
      </p>
      <p className="text-title text-default-white">{timeStr}</p>
    </div>
  );

  const renderNeutralTimeoutPanel = () => (
    <div className="timebox neutral">
      {renderDragHandle()}
      <div className="absolute right-2 top-2">
        <TimeBoxManageButtons
          info={props.info}
          prosTeamName={props.prosTeamName}
          consTeamName={props.consTeamName}
          eventHandlers={{
            onSubmitEdit,
            onSubmitDelete,
            onSubmitCopy,
          }}
        />
      </div>
      <p className="text-detail mb-2 text-default-white">{speechType}</p>
      <p className="text-title text-default-white">{timeStr}</p>
    </div>
  );

  const renderNeutralCustomPanel = () => (
    <div className="timebox time-based">
      {isModifiable && (
        <>
          {renderDragHandle()}
          <div className="absolute right-2 top-2">
            <TimeBoxManageButtons
              info={props.info}
              prosTeamName={props.prosTeamName}
              consTeamName={props.consTeamName}
              eventHandlers={{
                onSubmitEdit,
                onSubmitDelete,
                onSubmitCopy,
              }}
            />
          </div>
        </>
      )}
      <span className="font-semibold">{speechType}</span>
      <span className="text-2xl font-semibold">{fullTimeStr}</span>
    </div>
  );

  return (
    <div className={`flex w-full items-center ${containerClass}`}>
      {(isPros || isCons) && renderProsConsPanel()}

      {isNeutralTimeout && renderNeutralTimeoutPanel()}
      {isNeutralCustom && renderNeutralCustomPanel()}
    </div>
  );
}
