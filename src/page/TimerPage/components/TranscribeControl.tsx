import { useTranslation } from 'react-i18next';
import { RiMicFill, RiMicOffFill } from 'react-icons/ri';
import clsx from 'clsx';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { TranscriberError } from '../hooks/useDebateTranscriber';

export interface TranscribeControlProps {
  isSupported: boolean;
  isEnabled: boolean;
  isListening: boolean;
  interimText: string;
  utteranceCount: number;
  error: TranscriberError | null;
  onEnable: () => void;
  onDisable: () => void;
}

const MIC_BUTTON_CLASS =
  'relative flex size-[64px] items-center justify-center rounded-full border-[2px] p-[16px] shadow-lg transition-colors';
const STATUS_PILL_CLASS =
  'flex w-fit items-center gap-2 rounded-full bg-default-black/80 px-3 py-1.5 text-sm font-semibold text-default-white';

// 타이머 화면에서 토론 음성 기록을 켜고 끄며, 인식 상태와 인식 중인 문장을 보여준다.
export default function TranscribeControl(props: TranscribeControlProps) {
  const {
    isSupported,
    isEnabled,
    isListening,
    interimText,
    utteranceCount,
    error,
    onEnable,
    onDisable,
  } = props;
  const { t } = useTranslation();
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });

  if (!isSupported) {
    return (
      <p className={STATUS_PILL_CLASS}>
        {t('토론 기록은 크롬 브라우저에서만 사용할 수 있어요')}
      </p>
    );
  }

  const label = isEnabled ? t('토론 기록 끄기') : t('토론 기록 켜기');
  const handleClick = () => {
    if (isEnabled) {
      onDisable();
      return;
    }
    openModal();
  };
  const handleConsent = () => {
    closeModal();
    onEnable();
  };

  return (
    <>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          aria-pressed={isEnabled}
          title={label}
          className={clsx(
            MIC_BUTTON_CLASS,
            isEnabled
              ? 'border-semantic-error bg-semantic-error text-default-white'
              : 'border-default-black2 bg-default-white text-default-black',
          )}
        >
          {isEnabled ? (
            <RiMicFill className="size-full" />
          ) : (
            <RiMicOffFill className="size-full" />
          )}
        </button>

        <div className="flex max-w-[360px] flex-col gap-2 pt-2">
          {isEnabled && (
            <p className={STATUS_PILL_CLASS} aria-live="polite">
              <span
                aria-hidden="true"
                className={clsx(
                  'size-2.5 rounded-full',
                  isListening
                    ? 'animate-pulse bg-semantic-error'
                    : 'bg-default-neutral',
                )}
              />
              {isListening ? t('기록 중') : t('타이머를 시작하면 기록해요')}
              <span className="font-normal text-default-white/70">
                {t('{{count}}문장', { count: utteranceCount })}
              </span>
            </p>
          )}
          {isEnabled && interimText && (
            <p className="line-clamp-2 rounded-[12px] bg-default-white/90 px-3 py-2 text-sm text-default-black2 shadow">
              {interimText}
            </p>
          )}
          {error === 'not-allowed' && (
            <p className={STATUS_PILL_CLASS}>
              {t('마이크 권한을 허용해야 토론을 기록할 수 있어요')}
            </p>
          )}
        </div>
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
            <p className="text-sm leading-relaxed text-default-black2">
              {t(
                '타이머가 실행되는 동안의 발언을 구글 음성 인식으로 텍스트로 바꿔요. 토론이 끝나면 속기록을 서버로 보내 AI가 분석 보고서를 만들어요.',
              )}
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
