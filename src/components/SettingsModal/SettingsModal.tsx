import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import useGlobalSettings from '../../hooks/useGlobalSettings';
import useLogout from '../../hooks/mutations/useLogout';
import { GlobalPortal } from '../../util/GlobalPortal';
import { oAuthLogin } from '../../util/googleAuth';
import { buildLangPath, isSupportedLang } from '../../util/languageRouting';
import { INQUIRY_LINKS } from '../../constants/urls';

const PANEL_CLASS =
  'relative max-h-[90dvh] w-[min(92vw,560px)] overflow-y-auto rounded-2xl bg-white p-6 text-ui-body text-neutral-900 shadow-xl';
/** 일반 화면의 전역 설정 진입점과 접근 가능한 모달임. */
interface SettingsModalProps {
  onLogin?: () => void;
  onLogout?: () => Promise<void>;
}
/**
 * 설정 모달의 위임 콜백은 경고·설정 발행·실패 표시를 소유함. 모달은 자기 창을 닫은 뒤 콜백을 호출하며 별도 설정 발행을 하지 않음. 일반 로그아웃의 설정 발행은 기존 모달이 소유함. MP-03은 이 계약과 독립 Story까지 준비하며 현재 헤더·자동 속기 팝업의 교체는 MP-04에서 수행함. 제품 정책은 토론 메뉴 위키가 소유함.
 *
 */
export default function SettingsModal(props: SettingsModalProps) {
  const { onLogin, onLogout } = props;
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
  const location = useLocation();
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
  const logout = useLogout(() => {
    setOpen(false);
    navigate(buildLangPath('/home', lang));
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
      event.stopImmediatePropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        void controller.flush();
        setOpen(false);
        trigger.current?.focus();
      }
      if (event.key === 'Tab') {
        const items = panel.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input,select',
        );
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
  // 타이머·청중의 헤더와 인증 동작은 MP-03/04에서 연결함.
  const path = buildLangPath(location.pathname, 'ko');
  if (
    path.startsWith('/live/') ||
    path.startsWith('/vote/') ||
    /^\/table\/customize\/[^/]+(?:\/end\/(?:feedback|vote\/[^/]+))?$/.test(path)
  ) {
    return null;
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label={t('설정')}
        onClick={() => setOpen(true)}
      >
        {t('설정')}
      </button>
      {open && (
        <GlobalPortal.Consumer>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
            >
              <div className="flex items-center justify-between">
                <h2 id="settings-title" className="text-ui-title">
                  {t('설정')}
                </h2>
                <button aria-label={t('모달 닫기')} onClick={handleClose}>
                  ×
                </button>
              </div>
              <section className="mt-6 space-y-4">
                <h3 className="text-ui-label">{t('일반 설정')}</h3>
                <label className="flex items-center justify-between">
                  {t('언어 선택')}
                  <select
                    value={lang}
                    onChange={(event) => {
                      const language = event.target.value;
                      if (!isSupportedLang(language)) {
                        return;
                      }
                      controller.change({ language });
                      void controller.flush();
                    }}
                  >
                    <option value="ko">{t('한국어')}</option>
                    <option value="en">{t('English')}</option>
                  </select>
                </label>
                <label className="flex flex-wrap items-center justify-between gap-3">
                  {t('음량')}
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={Math.round(settings.volume * 10)}
                    onChange={(event) =>
                      controller.change({
                        volume: Number(event.target.value) / 10,
                      })
                    }
                    onPointerUp={() => void controller.flush()}
                    onKeyUp={() => void controller.flush()}
                    onBlur={() => void controller.flush()}
                  />
                  <output>{Math.round(settings.volume * 10)}</output>
                </label>
              </section>
              {INQUIRY_LINKS.length > 0 && (
                <section className="mt-6 space-y-2">
                  <h3 className="text-ui-label">{t('문의')}</h3>
                  {INQUIRY_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block underline"
                    >
                      {t(item.label)}
                    </a>
                  ))}
                </section>
              )}
              <section className="mt-6 space-y-3">
                <h3 className="text-ui-label">{t('계정')}</h3>
                {settings.memberId ? (
                  <button
                    disabled={busy || logout.isPending}
                    aria-label={t('로그아웃')}
                    onClick={() => void handleLogout()}
                  >
                    {t('로그아웃')}
                  </button>
                ) : (
                  <button
                    aria-label={t('로그인')}
                    onClick={() => {
                      handleClose();
                      (onLogin ?? oAuthLogin)();
                    }}
                  >
                    {t('로그인')}
                  </button>
                )}
                {failedLogout && (
                  <p role="alert">
                    {t('로그아웃에 실패했습니다. 다시 시도해 주세요')}
                  </p>
                )}
              </section>
            </div>
          </div>
        </GlobalPortal.Consumer>
      )}
    </>
  );
}
