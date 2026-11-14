import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLoginPrompt from '../../hooks/useLoginPrompt';
import useDialogFocus from '../../hooks/useDialogFocus';
import { GlobalPortal } from '../../util/GlobalPortal';

interface LoginPromptProps {
  login: ReturnType<typeof useLoginPrompt>;
}
const OVERLAY_CLASS =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4';
const PANEL_CLASS =
  'max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-ui-body text-neutral-900 shadow-xl';
const BUTTON_CLASS =
  'min-h-11 rounded-xl border border-neutral-400 px-4 py-2 text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2';

/** 목적지 선택 후 OAuth 시작 전에 로그인과 게스트 시간표 유지 여부를 확인함. */
export default function LoginPrompt(props: LoginPromptProps) {
  const { login } = props;
  const { t } = useTranslation();
  const titleId = useId();
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  useDialogFocus(panel, login.cancel);
  if (!login.isOpen) {
    return null;
  }
  return (
    <GlobalPortal.Consumer>
      <div
        data-timer-overlay
        className={OVERLAY_CLASS}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            login.cancel();
          }
        }}
      >
        <div
          ref={setPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={PANEL_CLASS}
        >
          <h2 id={titleId} className="text-ui-title">
            {t('로그인이 필요합니다')}
          </h2>
          <p className="mt-4">{t('로그인 후 선택한 화면으로 이동합니다.')}</p>
          {login.hasGuestTable && (
            <label className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                checked={login.keepGuestTable}
                onChange={(event) =>
                  login.setKeepGuestTable(event.target.checked)
                }
              />
              {t('로그인 후에도 이 시간표를 계속 사용하시겠습니까?')}
            </label>
          )}
          {login.hasError && (
            <p role="alert" className="mt-4 text-red-700">
              {t('로그인을 시작하지 못했습니다. 다시 시도해 주세요.')}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              aria-label={t('취소')}
              className={BUTTON_CLASS}
              onClick={login.cancel}
            >
              {t('취소')}
            </button>
            <button
              type="button"
              aria-label={t('로그인')}
              className={`${BUTTON_CLASS} bg-brand hover:bg-brand-hover`}
              onClick={login.start}
            >
              {t('로그인')}
            </button>
          </div>
        </div>
      </div>
    </GlobalPortal.Consumer>
  );
}
