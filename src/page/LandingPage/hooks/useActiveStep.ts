import { RefObject, useEffect, useState } from 'react';

/** 화면 세로 가운데 띠에 들어온 단계를 현재 단계로 판정하기 위한 관찰 영역 */
const CENTER_BAND_MARGIN = '-45% 0px -45% 0px';

/**
 * 컨테이너 안 `data-step-id` 요소 중 화면 가운데를 지나는 단계의 id를 반환함.
 * 관찰이 불가능한 환경이면 첫 단계를 현재 단계로 유지함.
 */
export default function useActiveStep(
  containerRef: RefObject<HTMLElement | null>,
  stepIds: string[],
) {
  const [activeStepId, setActiveStepId] = useState(stepIds[0] ?? null);
  const stepKey = stepIds.join('|');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const centered = entries.find((entry) => entry.isIntersecting);
        const stepId = (centered?.target as HTMLElement | undefined)?.dataset
          .stepId;
        if (stepId) {
          setActiveStepId(stepId);
        }
      },
      { rootMargin: CENTER_BAND_MARGIN },
    );

    container
      .querySelectorAll<HTMLElement>('[data-step-id]')
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [containerRef, stepKey]);

  return activeStepId;
}
