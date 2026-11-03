import { useTranslation } from 'react-i18next';
import { isLoggedIn } from '../../../util/accessToken';

interface ClosingCtaSectionProps {
  onStartWithoutLogin: () => void;
  onLoginStart: () => void;
  onDashboardButtonClicked: () => void;
}

const DARK_BUTTON =
  'rounded-full bg-neutral-900 px-7 py-3.5 text-ui-label text-white transition-colors hover:bg-neutral-700';
const LIGHT_BUTTON =
  'rounded-full bg-white px-7 py-3.5 text-ui-label text-neutral-900 transition-colors hover:bg-neutral-100';

export default function ClosingCtaSection(props: ClosingCtaSectionProps) {
  const { onStartWithoutLogin, onLoginStart, onDashboardButtonClicked } = props;
  const { t } = useTranslation();

  return (
    <section className="flex w-full justify-center bg-brand px-4 py-18">
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-[min(max(1.5rem,3vw),2.5rem)] leading-tight font-bold">
          {t('우리 시간표, 저장해 두세요')}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {isLoggedIn() ? (
            <button
              type="button"
              className={DARK_BUTTON}
              onClick={onDashboardButtonClicked}
              aria-label={t('대시보드로 이동')}
            >
              {t('대시보드로 이동')}
            </button>
          ) : (
            <>
              <button
                type="button"
                className={DARK_BUTTON}
                onClick={onLoginStart}
                aria-label={t('3초 로그인')}
              >
                {t('3초 로그인')}
              </button>
              <button
                type="button"
                className={LIGHT_BUTTON}
                onClick={onStartWithoutLogin}
                aria-label={t('비회원으로 시작하기')}
              >
                {t('비회원으로 시작하기')}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
