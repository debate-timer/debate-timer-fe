import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RiCheckLine, RiMicFill } from 'react-icons/ri';
import clsx from 'clsx';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';

interface TranscriptGeneratingProps {
  tableName: string;
  agenda: string;
  // AI가 STT 원문을 보정하는 중이면 true, 보정이 끝나고 분석 보고서를 만드는 중이면 false
  refining: boolean;
}

type StepState = 'done' | 'active' | 'waiting';

const STEP_CLASS =
  'flex items-center gap-4 rounded-[20px] border-2 bg-default-white p-4 text-left transition';
const STEP_DOT_CLASS =
  'flex size-8 flex-none items-center justify-center rounded-full text-sm font-bold';

// 속기록 보정과 분석 보고서 발행이 끝날 때까지 속기록 화면 대신 진행 단계를 보여준다.
export default function TranscriptGenerating(props: TranscriptGeneratingProps) {
  const { tableName, agenda, refining } = props;
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const steps: { title: string; description: string; state: StepState }[] = [
    {
      title: t('속기록 보정 중'),
      description: t('음성 인식 오류와 문장부호를 다듬고 있어요'),
      state: refining ? 'active' : 'done',
    },
    {
      title: t('분석 보고서 발행 중'),
      description: t('쟁점과 핵심 발언을 정리하고 있어요'),
      state: refining ? 'waiting' : 'active',
    },
  ];
  const doneCount = steps.filter(({ state }) => state === 'done').length;

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 py-10 md:py-16">
      <div className="relative mb-8 flex size-24 items-center justify-center rounded-full bg-brand/30">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
        <span className="relative flex size-16 items-center justify-center rounded-full bg-brand">
          <RiMicFill className="size-7" />
        </span>
      </div>
      <p className="text-sm text-default-border">{tableName}</p>
      <h1 className="mt-1 text-center text-2xl font-bold md:text-[28px]">
        {agenda}
      </h1>
      <p className="mt-3 font-semibold">{t('토론 기록을 만들고 있어요')}</p>

      <div
        role="progressbar"
        aria-label={t('토론 기록 생성 진행률')}
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={doneCount}
        className="mt-8 h-2 w-full overflow-hidden rounded-full bg-default-dim2"
      >
        <div
          className="h-full rounded-full bg-brand transition-all duration-700"
          style={{ width: `${((doneCount + 0.5) / steps.length) * 100}%` }}
        />
      </div>

      <ol className="mt-6 flex w-full flex-col gap-3">
        {steps.map(({ title, description, state }, index) => (
          <li
            key={title}
            aria-label={title}
            aria-current={state === 'active' ? 'step' : undefined}
            data-state={state}
            className={clsx(
              STEP_CLASS,
              state === 'active' ? 'border-brand' : 'border-default-dim2',
              state === 'waiting' && 'opacity-40',
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
                STEP_DOT_CLASS,
                state === 'done' && 'bg-default-black text-default-white',
                state === 'active' && 'animate-pulse bg-brand',
                state === 'waiting' && 'bg-default-dim2',
              )}
            >
              {state === 'done' ? (
                <RiCheckLine className="size-5" />
              ) : (
                index + 1
              )}
            </span>
            <span>
              <span className="block font-bold">{title}</span>
              <span className="block text-sm text-default-border">
                {description}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-center text-sm text-default-border">
        {t(
          '화면을 닫아도 괜찮아요. 완료되면 대시보드의 토론 기록에서 볼 수 있어요.',
        )}{' '}
        <Link
          to={buildLangPath('/home?tab=records', lang)}
          className="font-semibold text-default-black underline"
        >
          {t('토론 기록으로 가기')}
        </Link>
      </p>
    </div>
  );
}
