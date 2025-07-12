import { HTMLAttributes } from 'react';
import TimeBoxManageButtons from '../TimeBoxManageButtons/TimeBoxManageButtons';
import { TimeBoxInfo } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import { LuArrowUpDown } from 'react-icons/lu';

interface DebatePanelProps extends HTMLAttributes<HTMLDivElement> {
  info: TimeBoxInfo;
  prosTeamName: string;
  consTeamName: string;
  onSubmitEdit?: (updatedInfo: TimeBoxInfo) => void;
  onSubmitDelete?: () => void;
  onSubmitCopy?: () => void;
}

export default function DebatePanel(props: DebatePanelProps) {
  const {
    stance,
    speechType,
    boxType,
    time,
    timePerTeam,
    timePerSpeaking,
    speaker,
  } = props.info;
  const { onSubmitEdit, onSubmitDelete, onSubmitCopy, onMouseDown } = props;

  // 타이머 시간 문자열 처리
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
      {onSubmitEdit && onSubmitDelete && onSubmitCopy && (
        <>
          {isPros ? (
            <>
              <div className="absolute left-2 top-2">
                <TimeBoxManageButtons
                  info={props.info}
                  prosTeamName={props.prosTeamName}
                  consTeamName={props.consTeamName}
                  onSubmitEdit={onSubmitEdit}
                  onSubmitDelete={onSubmitDelete}
                  onSubmitCopy={onSubmitCopy}
                />
              </div>
              {renderDragHandle()}
            </>
          ) : (
            <>
              {renderDragHandle()}
              <div className="absolute right-2 top-2">
                <TimeBoxManageButtons
                  info={props.info}
                  prosTeamName={props.prosTeamName}
                  consTeamName={props.consTeamName}
                  onSubmitEdit={onSubmitEdit}
                  onSubmitDelete={onSubmitDelete}
                  onSubmitCopy={onSubmitCopy}
                />
              </div>
            </>
          )}
        </>
      )}
      <div className="font-semibold">
        {speechType} {speaker && `| ${speaker} 토론자`}
      </div>
      <div className="text-2xl font-semibold">{timeStr}</div>
    </div>
  );

  const renderNeutralTimeoutPanel = () => (
    <div className="relative flex h-20 w-full flex-col items-center justify-center rounded-md bg-neutral-400 p-2 font-medium ">
      {onSubmitEdit && onSubmitDelete && onSubmitCopy && (
        <>
          {renderDragHandle()}
          <div className="absolute right-2 top-2">
            <TimeBoxManageButtons
              info={props.info}
              prosTeamName={props.prosTeamName}
              consTeamName={props.consTeamName}
              onSubmitEdit={onSubmitEdit}
              onSubmitDelete={onSubmitDelete}
              onSubmitCopy={onSubmitCopy}
            />
          </div>
        </>
      )}
      <span className="font-semibold">{speechType}</span>
      <span className="text-2xl font-semibold">{timeStr}</span>
    </div>
  );

  const renderNeutralCustomPanel = () => (
    <div className="relative flex h-20 w-full flex-col items-center justify-center rounded-md bg-brand-main p-2 font-medium ">
      {onSubmitEdit && onSubmitDelete && onSubmitCopy && (
        <>
          {renderDragHandle()}
          <div className="absolute right-2 top-2">
            <TimeBoxManageButtons
              info={props.info}
              prosTeamName={props.prosTeamName}
              consTeamName={props.consTeamName}
              onSubmitEdit={onSubmitEdit}
              onSubmitDelete={onSubmitDelete}
              onSubmitCopy={onSubmitCopy}
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
