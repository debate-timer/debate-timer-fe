import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalPortal } from '../../../util/GlobalPortal';
import useDebateLogout from '../hooks/useDebateLogout';
import useDebateOverlay from '../hooks/useDebateOverlay';

interface DebateLogoutDialogProps {
  logout: ReturnType<typeof useDebateLogout>;
}
const PANEL_CLASS =
  'max-h-[90dvh] w-[min(92vw,520px)] overflow-y-auto rounded-2xl bg-white p-6 text-ui-body text-neutral-900 shadow-xl';

/** 로그아웃의 기록 폐기 경고와 실패 후 재시도를 표시함. */
export default function DebateLogoutDialog(props: DebateLogoutDialogProps) {
  const { logout } = props;
  const { t } = useTranslation();
  const titleId = useId();
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  useDebateOverlay(panel, logout.cancelLogout);
  if (!logout.isConfirmOpen) {
    return null;
  }
  return (
    <GlobalPortal.Consumer>
      <div
        data-timer-overlay
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            logout.cancelLogout();
          }
        }}
      >
        <div
          ref={setPanel}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={PANEL_CLASS}
        >
          <h2 id={titleId} className="text-ui-title">
            {t('토론 중 로그아웃할까요?')}
          </h2>
          <p className="mt-4">
            {t(
              '진행을 중단하고 미제출 기록을 삭제합니다. 삭제한 기록은 복원할 수 없습니다.',
            )}
          </p>
          {logout.hasError && (
            <p role="alert" className="mt-4 text-red-700">
              {t(
                '로그아웃에 실패했습니다. 진행은 중단된 상태입니다. 다시 시도해 주세요.',
              )}
            </p>
          )}
          {logout.isPending && <p role="status">{t('로그아웃 처리 중')}</p>}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              aria-label={t('취소')}
              disabled={logout.isPending}
              onClick={logout.cancelLogout}
              className="min-h-11 rounded-xl border border-neutral-400 px-4 text-ui-label"
            >
              {t('취소')}
            </button>
            <button
              type="button"
              aria-label={t('로그아웃')}
              disabled={logout.isPending}
              onClick={() => void logout.confirmLogout()}
              className="min-h-11 rounded-xl bg-brand px-4 text-ui-label hover:bg-brand-hover"
            >
              {t('로그아웃')}
            </button>
          </div>
        </div>
      </div>
    </GlobalPortal.Consumer>
  );
}
