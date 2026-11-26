import { Ref, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoQrCodeSharp } from 'react-icons/io5';
import Button from '../../../components/Button/Button';
import type { DebateControls } from '../hooks/useDebateControls';
import DebateFeatureSection from './DebateFeatureSection';
import ShareLinkControl from './ShareLinkControl';

const SHARE_ERRORS = {
  token: '사회자 인증 토큰 발급에 실패했어요...',
  replaced:
    '다른 탭이나 기기에서 라이브 공유를 시작해서 이 화면의 공유를 멈췄어요.',
  disconnected: '라이브 서버와 연결이 끊겼어요. 다시 연결해 주세요.',
  else: '공유 연결에 실패했습니다. 다시 시도해 주세요.',
};
const TRANSCRIPT_ERRORS = {
  'not-allowed': '마이크 권한을 허용해야 토론을 기록할 수 있어요',
  unsupported: '이 브라우저에서는 음성 기록을 지원하지 않습니다.',
  recognition: '음성 인식이 중단됐어요.',
  session: '녹음 세션에 연결하지 못했어요.',
};

interface FeatureProps {
  controls: DebateControls;
  unavailableReason?: string;
  onToggle: (next: boolean) => void;
}
interface ShareMenuSectionProps extends FeatureProps {
  qrButtonRef: Ref<HTMLButtonElement>;
  errorRef: Ref<HTMLParagraphElement>;
}

export function ShareMenuSection(props: ShareMenuSectionProps) {
  const { controls, unavailableReason, onToggle, qrButtonRef, errorRef } =
    props;
  const { t } = useTranslation();
  const { share, shareUrl, menuIssues } = controls;
  const { hasShareError } = menuIssues;
  const restriction =
    unavailableReason ??
    (!controls.canShare && t('회원만 사용할 수 있는 기능입니다.'));
  let status = t('비활성화');
  if (hasShareError) status = t('공유 오류');
  else if (share.isLoading) status = t('공유 연결 중');
  else if (share.isSharing) status = t('공유 중');

  const retryLabel = share.hasStopError
    ? t('공유 다시 시작')
    : share.errorType === 'replaced'
      ? t('이 기기에서 다시 시작')
      : t('공유 다시 시도');
  let details;
  if (hasShareError) {
    details = (
      <>
        <p ref={errorRef} role="alert" tabIndex={-1} className="text-red-800">
          {t(
            share.hasStopError
              ? '중단 명령을 발행하지 못했습니다. 이 기기의 공유 연결은 종료했습니다.'
              : SHARE_ERRORS[share.errorType],
          )}
        </p>
        {restriction ? (
          <p>{restriction}</p>
        ) : (
          <Button
            variant="secondary"
            shape="rounded"
            aria-label={retryLabel}
            onClick={() => onToggle(true)}
          >
            {retryLabel}
          </Button>
        )}
      </>
    );
  } else if (restriction) {
    details = <p>{restriction}</p>;
  } else if (share.isSharing) {
    details = (
      <>
        <ShareLinkControl key={shareUrl} shareUrl={shareUrl} placement="menu" />
        {controls.transcript.multiDeviceSession && (
          <p className="text-ui-caption text-neutral-700">
            {t('이 링크로 들어온 청중은 녹음에 참여할 수 있어요.')}
          </p>
        )}
        <Button
          ref={qrButtonRef}
          shape="rounded"
          className="w-full"
          aria-label={t('QR 크게 보기')}
          onClick={controls.openShareQr}
        >
          <IoQrCodeSharp aria-hidden />
          {t('QR 크게 보기')}
        </Button>
      </>
    );
  }
  return (
    <DebateFeatureSection
      title={t('실시간 공유')}
      active={share.isSharing}
      disabled={Boolean(restriction) || share.isLoading}
      onToggle={onToggle}
      status={status}
      hasError={hasShareError}
      description={t(
        '청중에게 현재 타이머 상태를 실시간으로 공유해요. 활성화 시 제공되는 QR 코드나 링크를 통해 접속할 수 있어요.',
      )}
    >
      {details}
    </DebateFeatureSection>
  );
}

export function TranscriptMenuSection(props: FeatureProps) {
  const { controls, unavailableReason, onToggle } = props;
  const { t } = useTranslation();
  const { transcript, menuIssues } = controls;
  const failureRef = useRef<HTMLParagraphElement>(null);
  const shareAdviceRef = useRef<HTMLParagraphElement>(null);
  const unsupported = !Object.values(transcript.supportedModes).some(Boolean);
  const restriction =
    unavailableReason ??
    (!controls.canTranscribe
      ? t('사용 권한이 필요한 기능입니다.')
      : unsupported
        ? t('이 브라우저에서는 음성 기록을 지원하지 않습니다.')
        : undefined);
  const hasError = controls.statuses.transcript === 'error';
  const status = !transcript.isEnabled
    ? t('비활성화')
    : controls.isMainTimerRunning
      ? t('녹음 중...')
      : t('녹음 대기 중');
  const figures = [];
  if (
    transcript.sttMode !== 'MULTI_DEVICE' &&
    (transcript.isEnabled || transcript.utteranceCount > 0)
  ) {
    figures.push(t('{{count}}문장 기록', { count: transcript.utteranceCount }));
  }
  if (transcript.pendingCount > 0) {
    figures.push(
      t('{{count}}개 구간 전사 중', { count: transcript.pendingCount }),
    );
  }
  const errorReason =
    transcript.error && t(TRANSCRIPT_ERRORS[transcript.error]);
  const showErrorReason = errorReason && errorReason !== restriction;
  const hasDetails = Boolean(
    restriction ||
    hasError ||
    figures.length ||
    transcript.failedCount ||
    menuIssues.hasShareAdvice,
  );
  return (
    <DebateFeatureSection
      title={t('속기록')}
      description={t(
        '타이머가 실행되는 동안 토론자의 발언을 녹음하고 텍스트로 전사해요. 전사된 텍스트는 토론이 끝난 후 속기록에서 확인할 수 있어요.',
      )}
      active={transcript.isEnabled}
      disabled={Boolean(restriction) || transcript.isPending}
      onToggle={onToggle}
      status={status}
      hasError={hasError}
    >
      {hasDetails && (
        <>
          {restriction && <p>{restriction}</p>}
          {figures.length > 0 && <p role="status">{figures.join(' · ')}</p>}
          {(showErrorReason || transcript.failedCount > 0) && (
            <div role={hasError ? 'alert' : undefined} className="text-red-800">
              {showErrorReason && <p>{errorReason}</p>}
              {transcript.failedCount > 0 && (
                <>
                  <p ref={failureRef} tabIndex={-1}>
                    {t(
                      transcript.sttMode === 'MULTI_DEVICE'
                        ? '사회자 기기에서 {{count}}개 구간 업로드 실패'
                        : '{{count}}개 구간 전사 실패',
                      { count: transcript.failedCount },
                    )}
                  </p>
                  {menuIssues.hasUnseenFailures && (
                    <Button
                      variant="text"
                      className="min-h-8 self-start"
                      aria-label={t('구간 실패 확인')}
                      onClick={() => {
                        menuIssues.acknowledgeFailures();
                        failureRef.current?.focus();
                      }}
                    >
                      {t('확인')}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
          {menuIssues.hasShareAdvice && (
            <div className="text-ui-caption text-neutral-700">
              <p ref={shareAdviceRef} tabIndex={-1}>
                {t('청중 기기도 녹음에 참여하려면 실시간 공유를 켜 주세요.')}
              </p>
              {menuIssues.hasUnseenShareAdvice && (
                <Button
                  variant="text"
                  className="min-h-8"
                  aria-label={t('실시간 공유 안내 확인')}
                  onClick={() => {
                    menuIssues.acknowledgeShareAdvice();
                    shareAdviceRef.current?.focus();
                  }}
                >
                  {t('확인')}
                </Button>
              )}
            </div>
          )}
          {hasError && !restriction && (
            <>
              <p className="text-ui-caption">
                {t('다시 시작하면 이후 발언부터 기록해요.')}
              </p>
              <Button
                shape="rounded"
                variant="secondary"
                aria-label={t('속기 다시 시도')}
                disabled={transcript.isPending}
                onClick={() => onToggle(true)}
              >
                {t('속기 다시 시도')}
              </Button>
            </>
          )}
        </>
      )}
    </DebateFeatureSection>
  );
}
