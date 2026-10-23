import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiMicFill } from 'react-icons/ri';
import clsx from 'clsx';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { SttMode } from '../../../types/transcript';
import { TranscriberError } from '../hooks/useDebateTranscriber';

export interface TranscribeControlProps {
  supportedModes: Record<SttMode, boolean>;
  sttMode: SttMode;
  // 한 번 기록을 시작한 모드는 같은 초안에 섞이지 않도록 바꿀 수 없다.
  isModeLocked: boolean;
  isEnabled: boolean;
  isListening: boolean;
  utteranceCount: number;
  pendingCount: number;
  failedCount: number;
  error: TranscriberError | null;
  // 타이머 화면에 처음 들어왔을 때 녹음할지 바로 묻는다.
  shouldPromptOnMount: boolean;
  onEnable: (mode: SttMode) => void;
  onDisable: () => void;
}

const STT_MODES: SttMode[] = ['RPC', 'SONIOX'];

// 녹음하지 않을 때는 "토론 녹화하기" 버튼, 녹음 중에는 "토론 녹음 중" 태그로 보이는 타원형 버튼
const RECORD_BUTTON_CLASS =
  'flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-base font-bold whitespace-nowrap shadow-lg transition-colors';
const STATUS_PILL_CLASS =
  'flex w-fit items-center gap-2 rounded-full bg-default-black/80 px-3 py-1.5 text-sm font-semibold text-default-white';
const MODE_OPTION_CLASS =
  'flex cursor-pointer items-start gap-3 rounded-[12px] border-2 px-4 py-3 text-left has-disabled:cursor-not-allowed has-disabled:opacity-40';

// 타이머 화면에서 토론 음성 기록을 켜고 끄며, 기록 모드와 인식·전사 상태를 보여준다.
export default function TranscribeControl(props: TranscribeControlProps) {
  const {
    supportedModes,
    sttMode,
    isModeLocked,
    isEnabled,
    isListening,
    utteranceCount,
    pendingCount,
    failedCount,
    error,
    shouldPromptOnMount,
    onEnable,
    onDisable,
  } = props;
  const { t } = useTranslation();
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const [selectedMode, setSelectedMode] = useState<SttMode>(sttMode);
  const hasPromptedRef = useRef(false);
  const isAnyModeSupported = STT_MODES.some((mode) => supportedModes[mode]);

  // 처음 들어왔을 때 한 번만 묻는다. 취소하면 마이크 버튼으로 다시 켤 수 있다.
  useEffect(() => {
    if (
      !shouldPromptOnMount ||
      hasPromptedRef.current ||
      isEnabled ||
      !isAnyModeSupported
    ) {
      return;
    }
    hasPromptedRef.current = true;
    setSelectedMode((mode) =>
      supportedModes[mode]
        ? mode
        : (STT_MODES.find((candidate) => supportedModes[candidate]) ?? mode),
    );
    openModal();
  }, [
    shouldPromptOnMount,
    isEnabled,
    isAnyModeSupported,
    supportedModes,
    openModal,
  ]);

  const modeLabels: Record<SttMode, string> = {
    RPC: t('실시간 인식 (크롬)'),
    SONIOX: t('발언 후 일괄 인식 (Soniox)'),
  };
  const modeDescriptions: Record<SttMode, string> = {
    RPC: t(
      '타이머가 실행되는 동안의 발언을 구글 음성 인식으로 텍스트로 바꿔요. 토론이 끝나면 속기록을 서버로 보내 AI가 분석 보고서를 만들어요.',
    ),
    SONIOX: t(
      '발언 구간이 끝날 때마다 녹음한 오디오를 서버로 보내 Soniox로 텍스트로 바꿔요. 토론이 끝나면 속기록을 서버로 보내 AI가 분석 보고서를 만들어요.',
    ),
  };

  if (!isAnyModeSupported) {
    return (
      <p className={STATUS_PILL_CLASS}>
        {t('이 브라우저에서는 토론 기록을 사용할 수 없어요')}
      </p>
    );
  }

  const consentMode = isModeLocked ? sttMode : selectedMode;
  const label = isEnabled ? t('토론 녹음 끄기') : t('토론 녹화하기');

  const handleClick = () => {
    if (isEnabled) {
      onDisable();
      return;
    }
    if (!isModeLocked && !supportedModes[selectedMode]) {
      setSelectedMode(STT_MODES.find((mode) => supportedModes[mode]) ?? 'RPC');
    }
    openModal();
  };
  const handleConsent = () => {
    closeModal();
    onEnable(consentMode);
  };

  return (
    <>
      {/* 오른쪽 위 공유 버튼 밑에 두므로 버튼과 상태 표시를 오른쪽 정렬한다. */}
      <div className="flex max-w-[360px] flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          aria-pressed={isEnabled}
          title={label}
          className={clsx(
            RECORD_BUTTON_CLASS,
            isEnabled
              ? 'border-semantic-error bg-semantic-error text-default-white'
              : 'border-default-black bg-default-white text-default-black hover:bg-default-dim2',
          )}
        >
          {isEnabled ? (
            <>
              <span
                aria-hidden="true"
                className={clsx(
                  'size-2.5 rounded-full bg-default-white',
                  isListening && 'animate-pulse',
                )}
              />
              {t('토론 녹음 중')}
            </>
          ) : (
            <>
              <RiMicFill aria-hidden="true" className="size-5" />
              {t('토론 녹화하기')}
            </>
          )}
        </button>

        {isEnabled && (
          <p className={STATUS_PILL_CLASS} aria-live="polite">
            {isListening
              ? t('{{count}}문장 기록', { count: utteranceCount })
              : t('타이머를 시작하면 기록해요')}
          </p>
        )}
        {isEnabled && pendingCount > 0 && (
          <p className={STATUS_PILL_CLASS} aria-live="polite">
            {t('{{count}}개 구간 전사 중', { count: pendingCount })}
          </p>
        )}
        {failedCount > 0 && (
          <p className={clsx(STATUS_PILL_CLASS, 'bg-semantic-error/90')}>
            {t('{{count}}개 구간 전사 실패', { count: failedCount })}
          </p>
        )}
        {error === 'not-allowed' && (
          <p className={STATUS_PILL_CLASS}>
            {t('마이크 권한을 허용해야 토론을 기록할 수 있어요')}
          </p>
        )}
      </div>

      <ModalWrapper>
        <DialogModal
          left={{ text: t('취소'), onClick: closeModal }}
          right={{
            text: t('동의하고 기록하기'),
            isBold: true,
            onClick: handleConsent,
          }}
        >
          <div className="flex flex-col gap-3 px-10 py-8 text-center">
            <p className="text-xl font-bold">
              {t('토론 음성 기록에 동의하시나요?')}
            </p>
            {!isModeLocked && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-semibold">
                  {t('음성 인식 방식')}
                </legend>
                {STT_MODES.map((mode) => (
                  <label
                    key={mode}
                    className={clsx(
                      MODE_OPTION_CLASS,
                      selectedMode === mode
                        ? 'border-brand'
                        : 'border-default-border',
                    )}
                  >
                    <input
                      type="radio"
                      name="stt-mode"
                      value={mode}
                      checked={selectedMode === mode}
                      disabled={!supportedModes[mode]}
                      onChange={() => setSelectedMode(mode)}
                      className="mt-1"
                    />
                    <span className="text-sm font-semibold">
                      {modeLabels[mode]}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <p className="text-sm leading-relaxed text-default-black2">
              {modeDescriptions[consentMode]}
            </p>
            <p className="text-sm font-semibold text-semantic-error">
              {t('참여자 모두에게 녹음 동의를 받아 주세요.')}
            </p>
          </div>
        </DialogModal>
      </ModalWrapper>
    </>
  );
}
