import { HTMLAttributes, PointerEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IoTimeSharp } from 'react-icons/io5';
import clsx from 'clsx';
import { Stance, TimeBoxInfo, TimeBoxType } from '../../types/type';
import { Formatting } from '../../util/formatting';
import { normalizeSpeechTypeKey } from '../../util/speechType';
import DTDrag from '../icons/Drag';
import SmallIconButtonContainer from '../SmallIconContainer/SmallIconContainer';

interface TimeBoxProps extends HTMLAttributes<HTMLDivElement> {
  info: TimeBoxInfo;
  actions?: ReactNode;
  onDragPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
}

type TimeBoxVariant = 'pros' | 'cons' | 'neutralTimeout' | 'neutralCustom';

interface VariantStyleConfig {
  containerClass: string;
  panelClass: string;
  shouldPlaceActionsLeft: boolean;
  shouldShowSpeaker: boolean;
}

const PANEL_BASE_CLASS =
  'flex items-center justify-between gap-2 rounded-xl p-3 select-none md:gap-3 md:p-4';
const TITLE_CLASS = 'truncate text-ui-label text-neutral-900 md:text-ui-title';
const SPEAKER_CLASS =
  'shrink-0 whitespace-pre text-ui-caption font-normal text-neutral-700 md:text-ui-body';

const VARIANT_CONFIG: Record<TimeBoxVariant, VariantStyleConfig> = {
  pros: {
    containerClass: 'justify-start',
    panelClass: 'w-[88%] bg-stance-blue/50 md:w-1/2',
    shouldPlaceActionsLeft: true,
    shouldShowSpeaker: true,
  },
  cons: {
    containerClass: 'justify-end',
    panelClass: 'w-[88%] bg-stance-red/50 md:w-1/2',
    shouldPlaceActionsLeft: false,
    shouldShowSpeaker: true,
  },
  neutralTimeout: {
    containerClass: 'justify-center',
    panelClass: 'w-full border border-neutral-200 bg-neutral-100',
    shouldPlaceActionsLeft: false,
    shouldShowSpeaker: false,
  },
  neutralCustom: {
    containerClass: 'justify-center',
    panelClass: 'w-full bg-brand/70',
    shouldPlaceActionsLeft: false,
    shouldShowSpeaker: false,
  },
};

function getPanelVariant(
  boxType: TimeBoxType,
  stance: Stance,
): TimeBoxVariant | null {
  if (stance === 'PROS') {
    return 'pros';
  }
  if (stance === 'CONS') {
    return 'cons';
  }
  if (boxType === 'NORMAL') {
    return 'neutralTimeout';
  }
  if (boxType === 'TIME_BASED') {
    return 'neutralCustom';
  }
  return null;
}

/** 토론 시간표의 단일 발언·작전시간·자유토론 블록을 표시함. */
export default function TimeBox(props: TimeBoxProps) {
  const { info, actions, onDragPointerDown, className, ...restProps } = props;
  const { t } = useTranslation();
  const {
    stance,
    speechType,
    boxType,
    time,
    timePerTeam,
    timePerSpeaking,
    speaker,
  } = info;
  const variantKey = getPanelVariant(boxType, stance);
  const variant = variantKey ? VARIANT_CONFIG[variantKey] : null;

  const normalizedSpeechType = normalizeSpeechTypeKey(speechType);
  const speechTypeLabel = normalizedSpeechType
    ? t(normalizedSpeechType)
    : speechType;

  const baseTime =
    boxType === 'NORMAL'
      ? Formatting.formatSecondsToMinutes(time ?? 0)
      : Formatting.formatSecondsToMinutes(timePerTeam ?? 0);
  const timeStr =
    boxType === 'NORMAL'
      ? t('{{minutes}}분 {{seconds}}초', baseTime)
      : t('팀당 {{minutes}}분 {{seconds}}초', baseTime);

  const timePerSpeakingStr =
    timePerSpeaking !== null
      ? t(
          '발언당 {{minutes}}분 {{seconds}}초',
          Formatting.formatSecondsToMinutes(timePerSpeaking),
        )
      : '';
  const displayTimeStr = timePerSpeakingStr
    ? `${timeStr} | ${timePerSpeakingStr}`
    : timeStr;

  const dragHandle = onDragPointerDown ? (
    <div
      className="flex shrink-0 cursor-grab touch-none items-center justify-center"
      onPointerDown={onDragPointerDown}
      title={t('위/아래로 드래그')}
    >
      <SmallIconButtonContainer className="h-[36px] w-[28px] px-[4px] py-[8px]">
        <DTDrag className="h-full" aria-hidden="true" />
      </SmallIconButtonContainer>
    </div>
  ) : null;

  const actionsSlot = actions ? (
    <div className="shrink-0">{actions}</div>
  ) : null;

  const leftSlot = variant?.shouldPlaceActionsLeft ? actionsSlot : dragHandle;
  const rightSlot = variant?.shouldPlaceActionsLeft ? dragHandle : actionsSlot;

  return (
    <div
      className={clsx(
        'flex w-full items-center',
        variant?.containerClass,
        className,
      )}
      {...restProps}
    >
      {variant && (
        <div className={clsx(PANEL_BASE_CLASS, variant.panelClass)}>
          {leftSlot}
          <div className="min-w-0 flex-1 text-center">
            <p className="flex min-w-0 items-center justify-center">
              <span className={TITLE_CLASS}>{speechTypeLabel}</span>
              {variant.shouldShowSpeaker && speaker && (
                <span className={SPEAKER_CLASS}>
                  {t(' | {{speaker}} 토론자', { speaker: t(speaker) })}
                </span>
              )}
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1 text-ui-label text-neutral-900">
              <IoTimeSharp className="size-4 shrink-0" aria-hidden="true" />
              <span>{displayTimeStr}</span>
            </p>
          </div>
          {rightSlot}
        </div>
      )}
    </div>
  );
}
