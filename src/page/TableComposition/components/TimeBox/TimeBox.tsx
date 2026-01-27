import { useTranslation } from 'react-i18next';
import { HTMLAttributes } from 'react';
import TimeBoxManageButtons from '../TimeBoxManageButtons/TimeBoxManageButtons';
import { TimeBoxInfo } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import DTDrag from '../../../../components/icons/Drag';
import SmallIconButtonContainer from '../../../../components/SmallIconContainer/SmallIconContainer';
import clsx from 'clsx';
import { normalizeSpeechTypeKey } from '../../../../util/speechType';

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
  const { t } = useTranslation();
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

  const getSpeechTypeLabel = (value: string) => {
    const normalized = normalizeSpeechTypeKey(value);
    return normalized ? t(normalized) : value;
  };
  let timeStr = '';
  let timePerSpeakingStr = '';

  if (boxType === 'NORMAL') {
    const { minutes, seconds } = Formatting.formatSecondsToMinutes(time!);
    timeStr = t('{{minutes}}분 {{seconds}}초', { minutes, seconds });
  } else {
    const { minutes, seconds } = Formatting.formatSecondsToMinutes(
      timePerTeam!,
    );
    timeStr = t('팀당 {{minutes}}분 {{seconds}}초', { minutes, seconds });
  }

  if (timePerSpeaking !== null) {
    const { minutes, seconds } =
      Formatting.formatSecondsToMinutes(timePerSpeaking);
    timePerSpeakingStr = t('발언당 {{minutes}}분 {{seconds}}초', {
      minutes,
      seconds,
    });
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
      title={t('위/아래로 드래그')}
    >
      <SmallIconButtonContainer className="h-[36px] w-[28px] px-[4px] py-[8px]">
        <DTDrag className="h-full" />
      </SmallIconButtonContainer>
    </div>
  );

  const renderProsConsPanel = () => (
    <div className={`timebox ${isPros ? 'pros' : 'cons'}`}>
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
      <span
        className={clsx('flex flex-row text-[22px] text-default-black', {
          'max-w-[200px]': isModifiable,
        })}
      >
        <p className="truncate font-semibold">
          {getSpeechTypeLabel(speechType)}
          {speaker && (
            <span className="font-medium">
              {t(' | {{speaker}} 토론자', { speaker })}
            </span>
          )}
        </p>
      </span>
      <p className="text-[22px] font-medium">{timeStr}</p>
    </div>
  );

  const renderNeutralTimeoutPanel = () => (
    <div className="timebox neutral">
      {isModifiable && renderDragHandle()}
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
      <p className="text-[22px] font-semibold text-default-black">
        {getSpeechTypeLabel(speechType)}
      </p>
      <p className="text-[22px] font-medium text-default-black">{timeStr}</p>
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
      <span className="text-[22px] font-semibold text-default-black">
        {getSpeechTypeLabel(speechType)}
      </span>
      <span className="text-[22px] font-medium text-default-black">
        {fullTimeStr}
      </span>
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
