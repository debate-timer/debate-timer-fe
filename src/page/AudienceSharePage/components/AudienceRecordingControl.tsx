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
  // 공유 링크에 녹음 세션·참가 코드가 있으면 true
  isAvailable: boolean;
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
 * 참여 버튼은 녹음 동의 대화상자를 열고, 동의하면 `onStart`를 실행함. 거절하면 보기만 계속함. 참여 중에는 녹음 여부·업로드 실패 수와 그만두기 버튼을 표시함. 녹음 참여 정보가 없는 링크에서는 아무것도 표시하지 않음.
 */
export default function AudienceRecordingControl(
  props: AudienceRecordingControlProps,
) {
  const {
    isAvailable,
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
      <ModalWrapper
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
      </ModalWrapper>
    </div>
  );
}
