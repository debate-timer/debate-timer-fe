import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalPortal } from '../../../util/GlobalPortal';
import DebateFeatureSection from './DebateFeatureSection';
import { DebateControls } from '../hooks/useDebateControls';
import useDebateOverlay from '../hooks/useDebateOverlay';
import MicCheckPanel from './MicCheckPanel';
import LiveShareQrPanel from './LiveShareQrPanel';
import { ShareMenuSection, TranscriptMenuSection } from './DebateMenuFeatures';
import Button from '../../../components/Button/Button';
import NotificationBadge from '../../../components/NotificationBadge/NotificationBadge';
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
  'fixed top-[var(--debate-menu-top)] left-[var(--debate-menu-left)] z-50 max-h-[calc(100dvh-var(--debate-menu-top)-16px)] w-[min(92vw,480px)] text-ui-body text-neutral-900';
const OPEN_TRIGGER_CLASS =
  'bg-brand/20! ring-1 ring-brand-hover enabled:hover:bg-brand/30!';
const ACTION_BASE_CLASS =
  'min-h-11 rounded-xl border px-4 py-2 text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';
const ACTION_CLASS = `${ACTION_BASE_CLASS} border-neutral-400`;

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
  const issueDescriptionId = useId();
  const confirmationTitleId = useId();
  const qrButtonRef = useRef<HTMLButtonElement>(null);
  const shareErrorRef = useRef<HTMLParagraphElement>(null);
  const previousOverlay = useRef(controls.overlay);
  const transcriptId = useId();
  const lastFeatureRef = useRef<'share' | 'transcript' | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const isMenu = controls.overlay === 'menu';
  const isOpen = controls.overlay !== 'closed';
  const { menuIssues } = controls;
  const hasTranscriptIssue =
    hasTranscriptFlag &&
    (menuIssues.hasTranscriptError ||
      menuIssues.hasUnseenFailures ||
      menuIssues.hasUnseenShareAdvice);
  const issueCount = controls.isInterrupted
    ? 0
    : Number(menuIssues.hasShareError) + Number(hasTranscriptIssue);
  const handleClose = () => {
    if (isMenu) {
      controls.closeOverlay();
    } else {
      controls.cancelConfirmation();
    }
  };
  useDebateOverlay(panel, handleClose, triggerRef, isMenu);
  useLayoutEffect(() => {
    const returningFromQr = previousOverlay.current === 'share-qr';
    previousOverlay.current = controls.overlay;
    if (!panel || !isMenu) {
      return;
    }
    if (returningFromQr) {
      (shareErrorRef.current ?? qrButtonRef.current ?? panel).focus();
      return;
    }
    if (lastFeatureRef.current) {
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
  const isShareConsent = controls.overlay === 'share-consent';
  const isShareQr = controls.overlay === 'share-qr';
  const isMicCheck = controls.overlay === 'mic-check';
  const availableModes = (['RPC', 'SONIOX', 'MULTI_DEVICE'] as const).filter(
    (mode) => controls.transcript.supportedModes[mode],
  );
  const title = isShareConsent
    ? t('실시간 공유를 시작할까요?')
    : isMicCheck
      ? t('마이크 테스트')
      : t('토론 음성 기록에 동의하시나요?');

  return (
    <>
      <Button
        className={clsx(
          'relative',
          HEADER_BUTTON_CLASS,
          isOpen && OPEN_TRIGGER_CLASS,
        )}
        ref={triggerRef}
        variant="secondary"
        shape="rounded"
        type="button"
        aria-label={t('토론 메뉴')}
        aria-describedby={issueCount > 0 ? issueDescriptionId : undefined}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={controls.isInterrupted}
        onClick={isOpen ? handleClose : controls.openMenu}
      >
        {t('토론 메뉴')}
        <NotificationBadge
          count={issueCount}
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 -right-2"
        />
      </Button>
      {issueCount > 0 && (
        <span id={issueDescriptionId} hidden>
          {t('확인할 기능 개수', { count: issueCount })}
        </span>
      )}
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
          contentClassName="p-5!"
        >
          <div className="mb-5">
            <h2 id={titleId} className="text-ui-title">
              {t('토론 메뉴')}
            </h2>
          </div>
          <div className="space-y-6">
            <ShareMenuSection
              controls={controls}
              unavailableReason={shareUnavailableReason}
              qrButtonRef={qrButtonRef}
              errorRef={shareErrorRef}
              onToggle={(next) => {
                lastFeatureRef.current = 'share';
                controls.requestShare(next);
              }}
            />
            {hasTranscriptFlag && (
              <TranscriptMenuSection
                controls={controls}
                unavailableReason={transcriptUnavailableReason}
                onToggle={(next) => {
                  lastFeatureRef.current = 'transcript';
                  controls.requestTranscript(next);
                }}
              />
            )}
            <DebateFeatureSection
              title={t('답변 시간 타이머')}
              toggleLabel={t('답변 시간')}
              description={t(
                '교차 조사 또는 주도권 토론 등에서 답변자에게 최소한의 답변 시간을 보장해줘야 할 때 사용해요.',
              )}
              active={controls.isAnswerTimeEnabled}
              onToggle={controls.changeAnswerEnabled}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-ui-label">
                  {t('최소 답변 보장 시간')}
                </span>
                <DropdownMenu
                  renderInPortal
                  aria-label={t('최소 답변 보장 시간')}
                  className="w-32"
                  selectedValue={controls.answerTime}
                  onSelect={controls.changeAnswerTime}
                  options={[15, 30, 45, 60].map((seconds) => ({
                    value: seconds,
                    label: t('{{seconds}}초', { seconds }),
                  }))}
                />
              </div>
            </DebateFeatureSection>
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
            aria-label={t('청중 입장')}
            onClose={controls.cancelConfirmation}
            closeOnOverlayClick
            showCloseButton
          >
            <LiveShareQrPanel
              key={controls.shareUrl}
              shareUrl={controls.shareUrl}
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
                <p>{t('청중에게 현재 타이머 상태를 실시간으로 공유합니다.')}</p>
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
                  {controls.selectedMode === 'MULTI_DEVICE' ? (
                    <p className="mt-3 text-ui-caption text-neutral-700">
                      {t(
                        '실시간 공유 링크로 들어온 청중의 기기도 녹음에 참여하고, 가장 깨끗한 녹음으로 속기록을 만들어요.',
                      )}
                    </p>
                  ) : (
                    // 다른 방식으로 켜면 청중 화면에 녹음 참여가 열리지 않으므로 고를 수 있을 때 알려 준다.
                    availableModes.includes('MULTI_DEVICE') && (
                      <p className="mt-3 text-ui-caption text-neutral-700">
                        {t(
                          "청중 기기도 함께 녹음하려면 'Soniox 다기기 녹음'을 골라 주세요.",
                        )}
                      </p>
                    )
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
