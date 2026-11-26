import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IoClose,
  IoGlobeOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoOpenOutline,
  IoSettingsSharp,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
} from 'react-icons/io5';
import useGlobalSettings from '../../hooks/useGlobalSettings';
import useLogout from '../../hooks/mutations/useLogout';
import { GlobalPortal } from '../../util/GlobalPortal';
import { oAuthLogin } from '../../util/googleAuth';
import {
  buildLangPath,
  isSupportedLang,
  SupportedLang,
} from '../../util/languageRouting';
import { INQUIRY_LINKS } from '../../constants/urls';
import Button from '../Button/Button';
import CustomRangeSlider from '../CustomRangeSlider/CustomRangeSlider';
import DropdownMenu, { DropdownMenuItem } from '../DropdownMenu/DropdownMenu';
import IconButton from '../IconButton/IconButton';

const PANEL_CLASS =
  'relative flex max-h-[90dvh] w-[min(92vw,520px)] flex-col overflow-hidden rounded-[20px] bg-white text-ui-body text-neutral-900 shadow-xl outline-none';
const PANEL_CONTENT_CLASS =
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6';
const CLOSE_BUTTON_CLASS =
  'flex size-11 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-reduce:transition-none';
const FOCUSABLE_SELECTOR =
  'button:not(:disabled):not([tabindex="-1"]),a[href],input:not(:disabled),select:not(:disabled)';
/** 일반·타이머 화면의 전역 설정 진입점과 접근 가능한 모달임. */
interface SettingsModalProps {
  /** 호출자가 설정 진입 버튼의 배치 맥락에 맞는 스타일을 전달함. */
  triggerClassName?: string;
  onLogin?: () => void;
  onLogout?: () => Promise<void>;
}
/**
 * 설정 모달의 위임 콜백은 경고·설정 발행·실패 표시를 소유함. 모달은 자기 창을 닫은 뒤 콜백을 호출하며 별도 설정 발행을 하지 않음. 일반 로그아웃의 설정 발행은 기존 모달이 소유함. MP-03은 이 계약과 독립 Story까지 준비하며 현재 헤더·자동 속기 팝업의 교체는 MP-04에서 수행함. 제품 정책은 토론 메뉴 위키가 소유함.
 *
 */
export default function SettingsModal(props: SettingsModalProps) {
  const { onLogin, onLogout, triggerClassName } = props;
  const { t, i18n } = useTranslation();
  const settings = useGlobalSettings();
  const { controller } = settings;
  const [open, setOpen] = useState(false);
  const [failedLogout, setFailedLogout] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const lang: SupportedLang =
    settings.language && isSupportedLang(settings.language)
      ? settings.language
      : isSupportedLang(i18n.language)
        ? i18n.language
        : 'ko';
  const volumeStep = Math.round(settings.volume * 10);
  const languageOptions: DropdownMenuItem<SupportedLang>[] = [
    { value: 'ko', label: t('한국어') },
    { value: 'en', label: t('English') },
  ];
  const logout = useLogout(() => {
    setOpen(false);
    navigate(buildLangPath('/', lang));
  });
  const handleClose = useCallback(() => {
    void controller.flush();
    setOpen(false);
    trigger.current?.focus();
  }, [controller]);
  useEffect(() => {
    if (!open) {
      return;
    }
    panel.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      const isInsidePanel =
        event.target instanceof Node && panel.current?.contains(event.target);
      if (!isInsidePanel) {
        event.stopImmediatePropagation();
      }
      if (event.key === 'Escape') {
        const hasExpandedDropdown = Boolean(
          panel.current?.querySelector('[aria-expanded="true"]'),
        );
        if (hasExpandedDropdown) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        void controller.flush();
        setOpen(false);
        trigger.current?.focus();
        return;
      }
      if (event.key === 'Tab') {
        const items =
          panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (!items?.length) {
          event.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === panel.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === panel.current)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [open, controller]);
  const handleLogout = async () => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      setFailedLogout(false);
      if (onLogout) {
        setOpen(false);
        trigger.current?.focus();
        await onLogout();
      } else {
        controller.issueBeforeLogout();
        await logout.mutateAsync();
      }
    } catch {
      if (!onLogout) {
        setFailedLogout(true);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <IconButton
        className={triggerClassName}
        ref={trigger}
        variant="secondary"
        shape="rounded"
        aria-label={t('설정')}
        title={t('설정')}
        onClick={() => setOpen(true)}
        icon={<IoSettingsSharp aria-hidden="true" />}
      />
      {open && (
        <GlobalPortal.Consumer>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                handleClose();
              }
            }}
          >
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
              tabIndex={-1}
              className={PANEL_CLASS}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <div className={PANEL_CONTENT_CLASS}>
                <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                  <h2
                    id="settings-title"
                    className="text-ui-title text-neutral-900"
                  >
                    {t('설정')}
                  </h2>
                  <button
                    type="button"
                    aria-label={t('모달 닫기')}
                    className={CLOSE_BUTTON_CLASS}
                    onClick={handleClose}
                  >
                    <IoClose className="size-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-5 space-y-6">
                  <section className="space-y-4">
                    <h3 className="text-ui-label text-neutral-600">
                      {t('일반 설정')}
                    </h3>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-ui-body text-neutral-900">
                        <IoGlobeOutline
                          className="size-5 shrink-0 text-neutral-500"
                          aria-hidden="true"
                        />
                        {t('언어 선택')}
                      </span>
                      <DropdownMenu
                        options={languageOptions}
                        selectedValue={lang}
                        aria-label={t('언어 선택')}
                        className="w-40 shrink-0"
                        onSelect={(language) => {
                          controller.change({ language });
                          void controller.flush();
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex shrink-0 items-center gap-2 text-ui-body text-neutral-900">
                        {volumeStep === 0 ? (
                          <IoVolumeMuteOutline
                            className="size-5 shrink-0 text-neutral-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <IoVolumeHighOutline
                            className="size-5 shrink-0 text-neutral-500"
                            aria-hidden="true"
                          />
                        )}
                        {t('음량')}
                      </span>
                      <div className="flex min-w-0 flex-1 items-center">
                        <CustomRangeSlider
                          value={volumeStep}
                          min={0}
                          max={10}
                          step={1}
                          ariaLabel={t('음량')}
                          onValueChange={(value) =>
                            controller.change({
                              volume: value / 10,
                            })
                          }
                          onValueCommit={() => void controller.flush()}
                        />
                      </div>
                      <output className="w-6 shrink-0 text-right text-ui-label text-neutral-700 tabular-nums">
                        {volumeStep}
                      </output>
                    </div>
                  </section>
                  {INQUIRY_LINKS.length > 0 && (
                    <section className="space-y-3 border-t border-neutral-200 pt-5">
                      <h3 className="text-ui-label text-neutral-600">
                        {t('문의')}
                      </h3>
                      <div className="space-y-2">
                        {INQUIRY_LINKS.map((item) => (
                          <Button
                            key={item.label}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="neutral"
                            shape="rounded"
                            aria-label={t(item.label)}
                            className="w-full justify-between px-4 py-3 no-underline"
                          >
                            <span>{t(item.label)}</span>
                            <IoOpenOutline
                              className="text-neutral-500"
                              aria-hidden="true"
                            />
                          </Button>
                        ))}
                      </div>
                    </section>
                  )}
                  <section className="space-y-3 border-t border-neutral-200 pt-5">
                    <h3 className="text-ui-label text-neutral-600">
                      {t('계정')}
                    </h3>
                    {settings.memberId ? (
                      <Button
                        variant="neutral"
                        className="w-full"
                        disabled={busy || logout.isPending}
                        aria-label={t('로그아웃')}
                        onClick={() => void handleLogout()}
                      >
                        <IoLogOutOutline aria-hidden="true" />
                        {t('로그아웃')}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        aria-label={t('로그인')}
                        onClick={() => {
                          handleClose();
                          (onLogin ?? oAuthLogin)();
                        }}
                      >
                        <IoLogInOutline aria-hidden="true" />
                        {t('로그인')}
                      </Button>
                    )}
                    {failedLogout && (
                      <p
                        role="alert"
                        className="rounded-lg bg-red-50 px-3 py-2 text-ui-caption text-red-600"
                      >
                        {t('로그아웃에 실패했습니다. 다시 시도해 주세요')}
                      </p>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </GlobalPortal.Consumer>
      )}
    </>
  );
}
