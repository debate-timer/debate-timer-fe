import type { ReactNode } from 'react';
import { LandingStep } from '../constants/landingSteps';
import TimelineStep from './TimelineStep';

interface TimelineSectionProps {
  steps: LandingStep[];
  /** 특정 단계 아래에 덧붙일 내용(예: 준비 단계의 템플릿 슬라이드) */
  renderStepExtra?: (step: LandingStep) => ReactNode;
}

export default function TimelineSection(props: TimelineSectionProps) {
  const { steps, renderStepExtra } = props;

  return (
    <section className="flex w-full justify-center px-4 pt-20 pb-8">
      <ol className="flex w-full max-w-[1000px] flex-col">
        {steps.map((step, index) => (
          <TimelineStep key={step.id} step={step} order={index + 1}>
            {renderStepExtra?.(step)}
          </TimelineStep>
        ))}
      </ol>
    </section>
  );
}
