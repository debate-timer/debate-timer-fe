import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingStep } from '../constants/landingSteps';
import { resolveLocalizedAsset } from '../../../util/localizedAsset';

interface TimelineStepProps {
  step: LandingStep;
  order: number;
  children?: ReactNode;
}

const SCENE_FRAME =
  'flex min-w-0 flex-[1_1_300px] items-center justify-center overflow-hidden rounded-2xl border border-neutral-200';

export default function TimelineStep(props: TimelineStepProps) {
  const { step, order, children } = props;
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;

  return (
    <li className="flex gap-5 md:gap-8">
      <div className="flex flex-none flex-col items-center">
        <span
          className={clsx(
            'flex size-11 items-center justify-center rounded-full border-[3px] border-neutral-900 text-ui-title md:size-14',
            step.isHighlighted
              ? 'bg-brand text-neutral-900'
              : 'bg-neutral-900 text-brand',
          )}
        >
          {order}
        </span>
        <div aria-hidden="true" className="w-0.5 grow bg-neutral-200" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5 pb-20 md:pb-24">
        <span className="text-ui-label text-neutral-500">{t(step.label)}</span>
        <div className="flex flex-col gap-2.5">
          {/* 단계 제목은 소개용 문구라 Title보다 크게 쓰고, 핵심 단계는 한 번 더 키우는 변형 */}
          <h3
            className={clsx(
              'leading-tight font-bold',
              step.isHighlighted
                ? 'text-[min(max(1.75rem,3.5vw),3rem)]'
                : 'text-[min(max(1.5rem,3vw),2.5rem)]',
            )}
          >
            {t(step.title)}
          </h3>
          <p className="text-ui-body text-neutral-600">{t(step.description)}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {step.scenes.map((scene) => {
            const src = resolveLocalizedAsset(scene.assets, lang);
            return (
              <div
                key={scene.id}
                className={clsx(
                  SCENE_FRAME,
                  step.isHighlighted
                    ? 'h-80 md:h-[440px]'
                    : 'h-64 md:h-[360px]',
                  step.isHighlighted ? 'bg-amber-50' : 'bg-neutral-50',
                )}
              >
                {src ? (
                  <img
                    src={src}
                    alt={t(scene.alt)}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="px-6 text-center text-ui-caption text-neutral-500">
                    {t(scene.alt)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {children}
      </div>
    </li>
  );
}
