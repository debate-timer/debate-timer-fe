import { useTranslation } from 'react-i18next';
import Button from '../../../components/Button/Button';
import { isLoggedIn } from '../../../util/accessToken';

interface ClosingCtaSectionProps {
  onStartWithoutLogin: () => void;
  onLoginStart: () => void;
  onDashboardButtonClicked: () => void;
}

export default function ClosingCtaSection(props: ClosingCtaSectionProps) {
  const { onStartWithoutLogin, onLoginStart, onDashboardButtonClicked } = props;
  const { t } = useTranslation();

  return (
    <section className="flex w-full justify-center bg-brand px-4 py-18">
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-[min(max(1.5rem,3vw),2.5rem)] leading-tight font-bold">
          {t('첫 토론, 지금 열어 보세요')}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {isLoggedIn() ? (
            <Button
              type="button"
              variant="dark"
              onClick={onDashboardButtonClicked}
              aria-label={t('대시보드로 이동')}
            >
              {t('대시보드로 이동')}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="dark"
                onClick={onLoginStart}
                aria-label={t('3초 로그인')}
              >
                {t('3초 로그인')}
              </Button>
              <Button
                type="button"
                variant="light"
                onClick={onStartWithoutLogin}
                aria-label={t('비회원으로 시작하기')}
              >
                {t('비회원으로 시작하기')}
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
