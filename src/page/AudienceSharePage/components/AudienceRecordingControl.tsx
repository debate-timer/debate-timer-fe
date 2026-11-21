import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../../hooks/useModal';
import {
  AudienceRecorderError,
  AudienceRecorderStatus,
} from '../hooks/useAudienceTurnRecorder';
import RecordingConsentDialog, {
  RECORDING_CONSENT_DESCRIPTION_ID,
  RECORDING_CONSENT_TITLE_ID,
} from './RecordingConsentDialog';

export interface AudienceRecordingControlProps {
  // 공유 링크나 공유 채널로 녹음 세션·참가 코드를 받았으면 true
  isAvailable: boolean;
  // 참여할 녹음 세션 키. 새 세션을 받으면 동의 대화상자를 한 번 바로 연다.
  sessionKey: string | null;
  isSupported: boolean;
  status: AudienceRecorderStatus;
  isListening: boolean;
  error: AudienceRecorderError | null;
  failedCount: number;
  onStart: () => void;
  onStop: () => void;
}

const ACTION_CLASS =
  'min-h-11 rounded-xl border border-neutral-400 bg-white px-4 py-2 text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';

/**
 * 공유 화면의 청중이 다기기 녹음에 참여하고 상태를 확인하는 영역을 표시함.
 *
 * 새 녹음 세션의 참가 정보를 받으면 녹음 동의 대화상자를 세션마다 한 번 바로 열고, 닫은 뒤에는 참여 버튼으로 다시 열 수 있음. 동의하면 `onStart`를 실행함. 거절하면 보기만 계속함. 참가 정보가 사라지면(사회자가 녹음을 끔) 열린 대화상자도 닫음. 참여 중에는 녹음 여부·업로드 실패 수와 그만두기 버튼을 표시함. 녹음 참여 정보가 없는 링크에서는 아무것도 표시하지 않음.
 */
export default function AudienceRecordingControl(
  props: AudienceRecordingControlProps,
) {
  const {
    isAvailable,
    sessionKey,
    isSupported,
    status,
    isListening,
    error,
    failedCount,
    onStart,
    onStop,
  } = props;
  const { t } = useTranslation();
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const promptedSessionKeyRef = useRef<string | null>(null);
  const canPrompt =
    isAvailable && isSupported && status === 'idle' && sessionKey !== null;

  useEffect(() => {
    if (!isAvailable) {
      closeModal();
      return;
    }
    if (canPrompt && promptedSessionKeyRef.current !== sessionKey) {
      promptedSessionKeyRef.current = sessionKey;
      openModal();
    }
  }, [canPrompt, closeModal, isAvailable, openModal, sessionKey]);

  if (!isAvailable) {
    return null;
  }

  const errorMessage =
    error === 'not-allowed'
      ? t('마이크 권한을 허용해야 녹음에 참여할 수 있어요.')
      : error === 'join'
        ? t('녹음에 참여하지 못했어요. 링크를 다시 확인해 주세요.')
        : error === 'unsupported'
          ? t('이 브라우저에서는 녹음에 참여할 수 없어요.')
          : error === 'unavailable'
            ? t(
                '지금은 녹음에 참여할 수 없어요. 녹음이 끝났거나 참여 기기가 가득 찼어요.',
              )
            : null;

  return (
    <div className="flex flex-col items-center gap-2 text-center text-ui-body">
      {!isSupported ? (
        <p className="text-ui-caption text-neutral-700">
          {t('이 브라우저에서는 녹음에 참여할 수 없어요.')}
        </p>
      ) : status === 'recording' ? (
        <>
          <p role="status">
            {isListening
              ? t('이 기기로 녹음하는 중이에요.')
              : t('녹음에 참여 중이에요. 타이머가 시작되면 녹음해요.')}
          </p>
          {failedCount > 0 && (
            <p className="text-red-700">
              {t('{{count}}개 구간을 올리지 못했어요.', { count: failedCount })}
            </p>
          )}
          <button
            type="button"
            aria-label={t('녹음 참여 그만하기')}
            className={ACTION_CLASS}
            onClick={onStop}
          >
            {t('녹음 참여 그만하기')}
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            aria-label={t('녹음 참여')}
            className={ACTION_CLASS}
            disabled={status === 'starting'}
            onClick={openModal}
          >
            {status === 'starting' ? t('녹음 준비 중') : t('녹음 참여')}
          </button>
          {errorMessage && <p role="alert">{errorMessage}</p>}
        </>
      )}
      <ModalWrapper>
        {/* main의 모달 틀에는 대화상자 역할이 없어 안내창 본문에 직접 붙인다. */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={RECORDING_CONSENT_TITLE_ID}
          aria-describedby={RECORDING_CONSENT_DESCRIPTION_ID}
        >
          <RecordingConsentDialog
            onCancel={closeModal}
            onConfirm={() => {
              closeModal();
              onStart();
            }}
          />
        </div>
      </ModalWrapper>
    </div>
  );
}
