import { useRef, type ReactNode } from 'react';
import { LandingStep } from '../constants/landingSteps';
import useActiveStep from '../hooks/useActiveStep';
import TimelineStep, { TimelineStepStatus } from './TimelineStep';

interface TimelineSectionProps {
  steps: LandingStep[];
  /** 특정 단계 아래에 덧붙일 내용(예: 준비 단계의 템플릿 슬라이드) */
  renderStepExtra?: (step: LandingStep) => ReactNode;
}

function getStepStatus(index: number, activeIndex: number): TimelineStepStatus {
  if (index === activeIndex) {
    return 'active';
  }
  return index < activeIndex ? 'done' : 'upcoming';
}

export default function TimelineSection(props: TimelineSectionProps) {
  const { steps, renderStepExtra } = props;
  const listRef = useRef<HTMLOListElement>(null);
  const activeStepId = useActiveStep(
    listRef,
    steps.map((step) => step.id),
  );
  const activeIndex = steps.findIndex((step) => step.id === activeStepId);

  return (
    <section className="flex w-full justify-center px-4 pt-20 pb-8">
      <ol ref={listRef} className="flex w-full max-w-[1000px] flex-col">
        {steps.map((step, index) => (
          <TimelineStep
            key={step.id}
            step={step}
            order={index + 1}
            status={getStepStatus(index, activeIndex)}
          >
            {renderStepExtra?.(step)}
          </TimelineStep>
        ))}
      </ol>
    </section>
  );
}
