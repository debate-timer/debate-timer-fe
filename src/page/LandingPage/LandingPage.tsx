import GeneralHeaderContainer from '../../layout/components/header/GeneralHeaderContainer';
import HeroSection from './components/HeroSection';
import UsingOrganizationsSection from './components/UsingOrganizationsSection';
import TimelineSection from './components/TimelineSection';
import TemplateMarquee from './components/TemplateMarquee';
import ClosingCtaSection from './components/ClosingCtaSection';
import LandingFooter from './components/LandingFooter';
import useLandingPageHandlers from './hooks/useLandingPageHandlers';
import { LANDING_STEPS } from './constants/landingSteps';
import { USING_ORGANIZATIONS } from './constants/usingOrganizations';
import UpdateModalWrapper from '../../components/UpdateModal/UpdateModalWrapper';

export default function LandingPage() {
  const {
    handleStartWithoutLogin,
    handleDashboardButtonClick,
    handleLoginStart,
  } = useLandingPageHandlers();

  return (
    <>
      <div className="flex w-full flex-col items-center bg-default-white">
        <GeneralHeaderContainer />

        <main className="flex w-full flex-col items-center">
          <HeroSection
            onStartWithoutLogin={handleStartWithoutLogin}
            onLoginStart={() => handleLoginStart('landing_hero')}
            onDashboardButtonClicked={handleDashboardButtonClick}
          />
          <UsingOrganizationsSection organizations={USING_ORGANIZATIONS} />
          <TimelineSection
            steps={LANDING_STEPS}
            renderStepExtra={(step) =>
              step.id === 'prepare' ? <TemplateMarquee /> : null
            }
          />
          <ClosingCtaSection
            onStartWithoutLogin={handleStartWithoutLogin}
            onLoginStart={() => handleLoginStart('landing_closing_cta')}
            onDashboardButtonClicked={handleDashboardButtonClick}
          />
        </main>

        <LandingFooter />
      </div>

      <UpdateModalWrapper />
    </>
  );
}
