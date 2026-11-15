import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalPortal } from '../../../util/GlobalPortal';
import ToggleButton from '../../../components/ToggleButton/ToggleButton';
import { DebateControls } from '../hooks/useDebateControls';
import useDebateOverlay from '../hooks/useDebateOverlay';
import MicCheckPanel from './MicCheckPanel';
import LiveShareQrPanel from './LiveShareQrPanel';
import { IoLinkOutline, IoQrCodeOutline } from 'react-icons/io5';
import { copyToClipboard } from '../../../util/clipboard';
import Button from '../../../components/Button/Button';
import Overlay from '../../../components/Overlay/Overlay';
import ModalFrame from '../../../components/ModalFrame/ModalFrame';
import DropdownMenu from '../../../components/DropdownMenu/DropdownMenu';
import clsx from 'clsx';
import { HEADER_BUTTON_CLASS } from '../../../layout/components/header/headerActionStyles';

interface DebateMenuProps {
  controls: DebateControls;
  hasTranscriptFlag: boolean;
  shareUnavailableReason?: string;
  transcriptUnavailableReason?: string;
  onLogin?: () => void;
}

const PANEL_CLASS =
  'fixed top-[var(--debate-menu-top)] left-[var(--debate-menu-left)] z-50 max-h-[calc(100dvh-var(--debate-menu-top)-16px)] w-[min(92vw,480px)] overflow-y-auto p-5! text-ui-body text-neutral-900';
const OPEN_TRIGGER_CLASS =
  'bg-brand/20! ring-1 ring-brand-hover enabled:hover:bg-brand/30!';
const ACTION_BASE_CLASS =
  'min-h-11 rounded-xl border px-4 py-2 text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';
const ACTION_CLASS = `${ACTION_BASE_CLASS} border-neutral-400`;
const ICON_ACTION_CLASS =
  'flex size-11 items-center justify-center rounded-xl border border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2';

/** 버튼 아래 메뉴는 유지하고 활성화 확인은 별도 모달에 표시함. 속기록은 피쳐 플래그가 있을 때만 노출함. */
export default function DebateMenu(props: DebateMenuProps) {
  const {
    controls,
    hasTranscriptFlag,
    shareUnavailableReason,
    transcriptUnavailableReason,
    onLogin,
  } = props;
  const { t } = useTranslation();
  const titleId = useId();
  const confirmationTitleId = useId();
  const shareId = useId();
  const transcriptId = useId();
  const lastFeatureRef = useRef<'share' | 'transcript' | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const isMenu = controls.overlay === 'menu';
  const isOpen = controls.overlay !== 'closed';
  const handleClose = () => {
    if (isMenu) {
      controls.closeOverlay();
    } else {
      controls.cancelConfirmation();
    }
  };
  useDebateOverlay(panel, handleClose, triggerRef, isMenu);
  useLayoutEffect(() => {
    if (!panel || !isMenu) {
      return;
    }
    if (isMenu && lastFeatureRef.current) {
      const buttons = panel.querySelectorAll<HTMLButtonElement>(
        'button[aria-pressed]',
      );
      buttons[lastFeatureRef.current === 'share' ? 0 : 1]?.focus();
      if (!panel.contains(document.activeElement)) {
        panel.focus();
      }
    } else {
      panel.focus();
    }
  }, [controls.overlay, isMenu, panel]);
  useLayoutEffect(() => {
    if (!panel) {
      return;
    }
    const positionPanel = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      panel.style.setProperty(
        '--debate-menu-top',
        `${Math.min((rect?.bottom ?? 80) + 8, Math.max(8, window.innerHeight - 160))}px`,
      );
      panel.style.setProperty(
        '--debate-menu-left',
        `${Math.max(16, Math.min(rect?.left ?? 16, window.innerWidth - panel.getBoundingClientRect().width - 16))}px`,
      );
    };
    positionPanel();
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    return () => {
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
    };
  }, [panel]);
  const handleCopy = async () =>
    setCopyStatus(
      (await copyToClipboard(controls.shareUrl)) ? 'copied' : 'failed',
    );
  const isShareConsent = controls.overlay === 'share-consent';
  const isShareQr = controls.overlay === 'share-qr';
  const isMicCheck = controls.overlay === 'mic-check';
  const availableModes = (['RPC', 'SONIOX', 'MULTI_DEVICE'] as const).filter(
    (mode) => controls.transcript.supportedModes[mode],
  );
  const SHARE_ERROR_MESSAGES = {
    token: '사회자 인증 토큰 발급에 실패했어요...',
    replaced:
      '다른 탭이나 기기에서 라이브 공유를 시작해서 이 화면의 공유를 멈췄어요.',
    disconnected: '라이브 서버와 연결이 끊겼어요. 새로고침 해주세요.',
    else: '공유 연결에 실패했습니다. 다시 시도해 주세요.',
  };
  const title = isShareConsent
    ? t('실시간 공유를 시작할까요?')
    : isMicCheck
      ? t('마이크 테스트')
      : t('토론 음성 기록에 동의하시나요?');

  return (
    <>
      <Button
        className={clsx(HEADER_BUTTON_CLASS, isOpen && OPEN_TRIGGER_CLASS)}
        ref={triggerRef}
        variant="secondary"
        shape="rounded"
        type="button"
        aria-label={t('토론 메뉴')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={controls.isInterrupted}
        onClick={isOpen ? handleClose : controls.openMenu}
      >
        {t('토론 메뉴')}
      </Button>
      <GlobalPortal.Consumer>
        <Overlay
          isOpen={isOpen}
          data-timer-overlay
          ref={setPanel}
          role="dialog"
          aria-labelledby={titleId}
          inert={isOpen && !isMenu}
          aria-hidden={isOpen && !isMenu}
          tabIndex={-1}
          direction="down"
          className={PANEL_CLASS}
        >
          <div className="mb-5">
            <h2 id={titleId} className="text-ui-title">
              {t('토론 메뉴')}
            </h2>
          </div>
          <div className="space-y-6">
            <section aria-label={t('실시간 공유')} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-ui-label">{t('실시간 공유')}</h3>
                <ToggleButton
                  aria-label={t('실시간 공유')}
                  aria-describedby={shareId}
                  isPressed={controls.share.isSharing}
                  onPressedChange={(next) => {
                    lastFeatureRef.current = 'share';
                    controls.requestShare(next);
                  }}
                  disabled={
                    !controls.canShare ||
                    Boolean(shareUnavailableReason) ||
                    controls.share.isLoading
                  }
                />
              </div>
              <p id={shareId} className="text-ui-caption text-neutral-700">
                {shareUnavailableReason ??
                  (!controls.canShare
                    ? t('회원만 사용할 수 있는 기능입니다.')
                    : t('청중에게 현재 타이머를 실시간으로 공유합니다.'))}
              </p>
              <p className="text-ui-caption text-neutral-700">
                {t(
                  '끄면 이 기기의 공유 연결을 종료합니다. 서버의 중단 완료는 확인하지 않습니다.',
                )}
              </p>
              {controls.share.isLoading && (
                <p role="status">{t('공유 연결 중')}</p>
              )}
              {controls.share.isError && (
                <div role="alert">
                  <p>
                    {t(
                      controls.share.hasStopError
                        ? '중단 명령을 발행하지 못했습니다. 이 기기의 공유 연결은 종료했습니다.'
                        : SHARE_ERROR_MESSAGES[controls.share.errorType],
                    )}
                  </p>
                  <button
                    type="button"
                    aria-label={t('공유 다시 시도')}
                    className={ACTION_CLASS}
                    onClick={() => controls.requestShare(true)}
                    disabled={
                      !controls.canShare || Boolean(shareUnavailableReason)
                    }
                  >
                    {t('공유 다시 시도')}
                  </button>
                </div>
              )}
              {controls.share.isSharing && (
                <>
                  {controls.transcript.multiDeviceSession && (
                    <p className="text-ui-caption text-neutral-700">
                      {t('이 링크로 들어온 청중은 녹음에 참여할 수 있어요.')}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={t('링크 복사')}
                      title={t('링크 복사')}
                      className={ICON_ACTION_CLASS}
                      onClick={() => void handleCopy()}
                    >
                      <IoLinkOutline className="size-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={t('QR 코드 보기')}
                      title={t('QR 코드 보기')}
                      className={ICON_ACTION_CLASS}
                      onClick={controls.openShareQr}
                    >
                      <IoQrCodeOutline className="size-5" aria-hidden />
                    </button>
                  </div>
                  <p role="status">
                    {copyStatus === 'copied'
                      ? t('링크 복사됨')
                      : copyStatus === 'failed'
                        ? t('링크 복사 실패')
                        : ''}
                  </p>
                </>
              )}
            </section>
            {hasTranscriptFlag && (
              <section aria-label={t('속기록')} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-ui-label">{t('속기록')}</h3>
                  <ToggleButton
                    aria-label={t('속기록')}
                    aria-describedby={transcriptId}
                    isPressed={controls.transcript.isEnabled}
                    onPressedChange={(next) => {
                      lastFeatureRef.current = 'transcript';
                      controls.requestTranscript(next);
                    }}
                    disabled={
                      !controls.canTranscribe ||
                      Boolean(transcriptUnavailableReason) ||
                      controls.transcript.isPending ||
                      !Object.values(controls.transcript.supportedModes).some(
                        Boolean,
                      )
                    }
                  />
                </div>
                <p
                  id={transcriptId}
                  className="text-ui-caption text-neutral-700"
                >
                  {transcriptUnavailableReason ??
                    (!controls.canTranscribe
                      ? t('사용 권한이 필요한 기능입니다.')
                      : t('타이머가 실행되는 동안 발언을 기록합니다.'))}
                </p>
                {!Object.values(controls.transcript.supportedModes).some(
                  Boolean,
                ) && (
                  <p>{t('이 브라우저에서는 음성 기록을 지원하지 않습니다.')}</p>
                )}
                {controls.transcript.isEnabled && (
                  <p>
                    {controls.transcript.isListening
                      ? t('{{count}}문장 기록', {
                          count: controls.transcript.utteranceCount,
                        })
                      : t('타이머를 시작하면 기록해요')}
                  </p>
                )}
                {controls.transcript.pendingCount > 0 && (
                  <p role="status">
                    {t('{{count}}개 구간 전사 중', {
                      count: controls.transcript.pendingCount,
                    })}
                  </p>
                )}
                {controls.transcript.failedCount > 0 && (
                  <p className="text-red-700">
                    {t('{{count}}개 구간 전사 실패', {
                      count: controls.transcript.failedCount,
                    })}
                  </p>
                )}
                {controls.statuses.transcript === 'error' && (
                  <div role="alert">
                    <p>
                      {t(
                        '음성 기록에 문제가 발생했습니다. 권한과 연결을 확인해 주세요.',
                      )}
                    </p>
                    <button
                      type="button"
                      aria-label={t('속기 다시 시도')}
                      className={ACTION_CLASS}
                      disabled={
                        !controls.canTranscribe ||
                        Boolean(transcriptUnavailableReason)
                      }
                      onClick={() => controls.requestTranscript(true)}
                    >
                      {t('속기 다시 시도')}
                    </button>
                  </div>
                )}
              </section>
            )}
            <section aria-label={t('답변 시간 타이머')} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-ui-label">{t('답변 시간 타이머')}</h3>
                <ToggleButton
                  aria-label={t('답변 시간')}
                  isPressed={controls.isAnswerTimeEnabled}
                  onPressedChange={controls.changeAnswerEnabled}
                />
              </div>
              <p className="text-ui-caption text-neutral-700">
                {t(
                  '교차 조사 또는 주도권 토론 등에서 답변자에게 최소한의 답변 시간을 보장해줘야 할 때 사용합니다.',
                )}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{t('답변 제한 시간')}</span>
                <DropdownMenu
                  renderInPortal
                  aria-label={t('답변 제한 시간')}
                  className="w-32"
                  selectedValue={controls.answerTime}
                  onSelect={controls.changeAnswerTime}
                  options={[15, 30, 45, 60].map((seconds) => ({
                    value: seconds,
                    label: t('{{seconds}}초', { seconds }),
                  }))}
                />
              </div>
            </section>
            {(shareUnavailableReason ||
              (hasTranscriptFlag && transcriptUnavailableReason)) &&
              onLogin && (
                <button
                  type="button"
                  aria-label={t('로그인')}
                  className={ACTION_CLASS}
                  onClick={onLogin}
                >
                  {t('로그인')}
                </button>
              )}
          </div>
        </Overlay>
        {isShareQr && (
          <ModalFrame
            aria-labelledby={confirmationTitleId}
            onClose={controls.cancelConfirmation}
            closeOnOverlayClick
          >
            <LiveShareQrPanel
              shareUrl={controls.shareUrl}
              titleId={confirmationTitleId}
            />
          </ModalFrame>
        )}
        {isOpen && !isMenu && !isShareQr && (
          <ModalFrame
            aria-labelledby={confirmationTitleId}
            onClose={controls.cancelConfirmation}
            closeOnOverlayClick
            showCloseButton={false}
          >
            <div className="w-[min(480px,calc(100vw-32px))] p-6 text-ui-body text-neutral-900">
              <h2 id={confirmationTitleId} className="mb-5 text-ui-title">
                {title}
              </h2>
              {isShareConsent ? (
                <p>{t('청중에게 현재 타이머를 실시간으로 공유합니다.')}</p>
              ) : isMicCheck ? (
                <MicCheckPanel />
              ) : (
                <>
                  <p className="mb-4 text-ui-body">
                    {t('참여자 모두에게 녹음 동의를 받아 주세요.')}
                  </p>
                  {/* 이 브라우저에서 쓸 수 없는 방식은 보여주지 않고, 하나만 남으면 선택지를 생략한다. */}
                  {availableModes.length > 1 && (
                    <fieldset className="space-y-3">
                      <legend className="text-ui-label">
                        {t('음성 인식 방식')}
                      </legend>
                      {availableModes.map((mode) => (
                        <label key={mode} className="flex gap-3">
                          <input
                            type="radio"
                            name={transcriptId}
                            checked={controls.selectedMode === mode}
                            disabled={controls.transcript.isModeLocked}
                            onChange={() => controls.changeMode(mode)}
                          />
                          {mode === 'RPC'
                            ? t('크롬 실시간 인식')
                            : mode === 'SONIOX'
                              ? t('Soniox 구간 전사')
                              : t('Soniox 다기기 녹음')}
                        </label>
                      ))}
                    </fieldset>
                  )}
                  {controls.selectedMode === 'MULTI_DEVICE' && (
                    <p className="mt-3 text-ui-caption text-neutral-700">
                      {t(
                        '실시간 공유 링크로 들어온 청중의 기기도 녹음에 참여하고, 가장 깨끗한 녹음으로 속기록을 만들어요.',
                      )}
                    </p>
                  )}
                </>
              )}
              {controls.transcript.isPending && (
                <p role="status">{t('마이크 권한 확인 중')}</p>
              )}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  aria-label={t('취소')}
                  className={ACTION_CLASS}
                  onClick={controls.cancelConfirmation}
                >
                  {t('취소')}
                </button>
                <button
                  type="button"
                  aria-label={t(
                    isShareConsent
                      ? '공유 시작'
                      : isMicCheck
                        ? '기록 시작'
                        : '동의하고 계속',
                  )}
                  className={`${ACTION_CLASS} bg-brand hover:bg-brand-hover`}
                  disabled={controls.transcript.isPending}
                  onClick={() => void controls.confirm()}
                >
                  {t(
                    isShareConsent
                      ? '공유 시작'
                      : isMicCheck
                        ? '기록 시작'
                        : '동의하고 계속',
                  )}
                </button>
              </div>
            </div>
          </ModalFrame>
        )}
      </GlobalPortal.Consumer>
    </>
  );
}
