import { Trans, useTranslation } from 'react-i18next';
import Button from '../../../components/Button/Button';
import { isLoggedIn } from '../../../util/accessToken';

interface HeroSectionProps {
  onStartWithoutLogin: () => void;
  onLoginStart: () => void;
  onDashboardButtonClicked: () => void;
}

// 형광펜으로 그은 느낌을 위해 양 끝을 같은 방향으로 비스듬히 자름
const HIGHLIGHT =
  'relative isolate inline-block bg-transparent px-3 text-default-black before:absolute before:inset-x-0 before:inset-y-[6%] before:-z-10 before:bg-brand before:[clip-path:polygon(0.4em_0,100%_0,calc(100%_-_0.4em)_100%,0_100%)] before:content-[""]';
export default function HeroSection(props: HeroSectionProps) {
  const { onStartWithoutLogin, onLoginStart, onDashboardButtonClicked } = props;
  const { t } = useTranslation();

  return (
    <section
      id="hero-section"
      className="flex flex-col items-center gap-7 px-4 pt-36 pb-16 text-center md:pt-44"
    >
      {/* 소개용 대표 문구라 Headline보다 크게 쓰는 변형 */}
      <h1 className="text-[min(max(2rem,4.5vw),3.5rem)] leading-tight font-bold whitespace-pre-line">
        <Trans
          i18nKey={
            '토론의 시작부터 끝까지,\n<highlight>디베이트 타이머</highlight> 하나로'
          }
          components={{ highlight: <mark className={HIGHLIGHT} /> }}
        />
      </h1>
      <div className="flex flex-wrap justify-center gap-3">
        {isLoggedIn() ? (
          <Button
            type="button"
            variant="primary"
            onClick={onDashboardButtonClicked}
            aria-label={t('대시보드로 이동')}
          >
            {t('대시보드로 이동')}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="primary"
              onClick={onStartWithoutLogin}
              aria-label={t('비회원으로 시작하기')}
            >
              {t('비회원으로 시작하기')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onLoginStart}
              aria-label={t('3초 로그인')}
            >
              {t('3초 로그인')}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
