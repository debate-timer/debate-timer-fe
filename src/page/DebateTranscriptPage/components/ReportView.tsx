import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { TEAM_STYLE, TimeBasedStance } from '../../../types/type';
import {
  DebateReport,
  EvidenceType,
  ReportArgument,
  ReportTeamFeedback,
  TranscriptLine,
} from '../../../types/transcript';
import { formatOffset } from '../transcriptFormatting';
import { STANCE_TEXT_CLASS } from '../stanceStyle';

interface ReportViewProps {
  report: DebateReport;
  lines: TranscriptLine[];
  onJumpToLine: (lineIndex: number) => void;
}

const EVIDENCE_STYLE: Record<
  EvidenceType,
  { label: string; className: string }
> = {
  SOURCED: {
    label: '출처 명시',
    className: 'bg-default-black text-default-white',
  },
  LOGICAL: {
    label: '논리·사례',
    className: 'bg-default-dim2 text-default-black2',
  },
  VAGUE: { label: '출처 불명확', className: 'bg-brand/40 text-default-black' },
  NONE: {
    label: '근거 없음',
    className: 'bg-semantic-warning/30 text-semantic-error',
  },
};

// 진영 머리 배경은 투표 화면 등과 같은 앱 공용 진영 색(TEAM_STYLE)을 쓴다.
const SIDE_STYLE: Record<
  TimeBasedStance,
  { label: string; border: string; bg: string }
> = {
  PROS: {
    label: '찬성',
    border: 'border-camp-blue',
    bg: TEAM_STYLE.PROS.baseBg,
  },
  CONS: {
    label: '반대',
    border: 'border-camp-red',
    bg: TEAM_STYLE.CONS.baseBg,
  },
};

const CHIP_CLASS =
  'inline-flex flex-none items-center rounded-full px-2.5 py-1 text-xs font-semibold';
const TIME_CHIP_CLASS =
  'inline-flex flex-none items-center rounded-full border border-default-disabled/hover bg-default-white px-2.5 py-1 font-mono text-xs text-default-black2 hover:border-brand hover:bg-brand/20';
const CLASH_NUMBER_CLASS =
  'flex size-7 flex-none items-center justify-center rounded-full bg-default-black text-sm font-bold text-default-white';
const KEY_MOMENT_CARD_CLASS =
  'flex flex-col gap-3 rounded-[24px] border-2 border-default-disabled/hover bg-default-white p-5 text-left transition hover:-translate-y-1 hover:border-brand hover:shadow-lg';

// AI가 만든 분석 보고서: 양측 주장과 근거, 충돌 쟁점, 큰 역할을 한 발언, 팀별 피드백
export default function ReportView(props: ReportViewProps) {
  const { report, lines, onJumpToLine } = props;
  const { t } = useTranslation();
  const findLine = (lineIndex: number) =>
    lines.find(({ index }) => index === lineIndex);

  const renderTimeChip = (lineIndex: number) => {
    const line = findLine(lineIndex);
    if (!line) {
      return null;
    }
    return (
      <button
        key={lineIndex}
        type="button"
        onClick={() => onJumpToLine(lineIndex)}
        aria-label={t('속기록에서 {{time}} 발언 보기', {
          time: formatOffset(line.offsetMs),
        })}
        className={TIME_CHIP_CLASS}
      >
        {formatOffset(line.offsetMs)}
      </button>
    );
  };

  const renderArguments = (side: TimeBasedStance, items: ReportArgument[]) => (
    <article
      className={clsx(
        'overflow-hidden rounded-[24px] border-2',
        SIDE_STYLE[side].border,
      )}
    >
      <h3
        className={clsx(
          'px-5 py-3 font-bold md:text-detail-raw',
          SIDE_STYLE[side].bg,
          STANCE_TEXT_CLASS[side],
        )}
      >
        {t(SIDE_STYLE[side].label)}
      </h3>
      {items.length === 0 && (
        <p className="p-5 text-sm text-default-border">
          {t('정리된 주장이 없어요')}
        </p>
      )}
      <ol className="divide-y-2 divide-default-dim2">
        {items.map((item, itemIndex) => (
          <li key={item.claim} className="p-5">
            <p className="flex gap-2 leading-snug font-bold">
              <span className={clsx('flex-none', STANCE_TEXT_CLASS[side])}>
                {t('주장 {{number}}', { number: itemIndex + 1 })}
              </span>
              <span>{item.claim}</span>
            </p>
            <ul className="mt-3 space-y-2 border-l-2 border-default-dim2 pl-3">
              {item.evidences.map((evidence) => (
                <li
                  key={evidence.content}
                  className="flex items-start gap-2 text-[15px]"
                >
                  <span
                    className={clsx(
                      CHIP_CLASS,
                      'mt-0.5',
                      EVIDENCE_STYLE[evidence.type].className,
                    )}
                  >
                    {t(EVIDENCE_STYLE[evidence.type].label)}
                  </span>
                  <span className="flex-1 leading-relaxed text-default-black2">
                    {evidence.content}
                  </span>
                  {renderTimeChip(evidence.lineIndex)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );

  const renderFeedback = (
    side: TimeBasedStance,
    feedback: ReportTeamFeedback,
  ) => (
    <article
      className={clsx(
        'overflow-hidden rounded-[24px] border-2',
        SIDE_STYLE[side].border,
      )}
    >
      <h3
        className={clsx(
          'px-5 py-3 font-bold md:text-detail-raw',
          SIDE_STYLE[side].bg,
          STANCE_TEXT_CLASS[side],
        )}
      >
        {t(SIDE_STYLE[side].label)}
      </h3>
      <div className="space-y-5 p-5">
        <FeedbackList
          title={t('좋았던 점')}
          items={feedback.strengths}
          mark="+"
        />
        <FeedbackList
          title={t('아쉬웠던 점')}
          items={feedback.weaknesses}
          mark="!"
        />
      </div>
    </article>
  );

  return (
    <div className="flex flex-col">
      <ReportSection number="01" title={t('양측 주장과 근거')}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {renderArguments('PROS', report.prosArguments)}
          {renderArguments('CONS', report.consArguments)}
        </div>
      </ReportSection>

      <ReportSection number="02" title={t('충돌했던 쟁점')}>
        <div className="flex flex-col gap-4">
          {report.clashes.map((clash, clashIndex) => (
            <article
              key={clash.title}
              className="border-default-disabled/hover overflow-hidden rounded-[20px] border-2"
            >
              <div className="flex items-center gap-2 px-5 py-4">
                <span className={CLASH_NUMBER_CLASS}>{clashIndex + 1}</span>
                <h3 className="flex-1 font-bold md:text-detail-raw">
                  {clash.title}
                </h3>
                <span
                  className={clsx(
                    CHIP_CLASS,
                    clash.advantage === 'PROS' &&
                      'bg-camp-blue text-default-white',
                    clash.advantage === 'CONS' &&
                      'bg-camp-red text-default-white',
                    clash.advantage === 'EVEN' &&
                      'bg-default-dim2 text-default-black2',
                  )}
                >
                  {clash.advantage === 'EVEN'
                    ? t('팽팽')
                    : t('{{side}} 우세', {
                        side: t(SIDE_STYLE[clash.advantage].label),
                      })}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-camp-blue/5 p-5">
                  <p className="mb-1 text-sm font-bold text-camp-blue">
                    {t('찬성')}
                  </p>
                  <p className="leading-relaxed">{clash.prosPosition}</p>
                </div>
                <div className="bg-camp-red/5 p-5">
                  <p className="mb-1 text-sm font-bold text-camp-red">
                    {t('반대')}
                  </p>
                  <p className="leading-relaxed">{clash.consPosition}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-default-black2">{clash.reason}</p>
                <div className="flex flex-wrap gap-1">
                  {clash.lineIndices.map(renderTimeChip)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </ReportSection>

      <ReportSection number="03" title={t('큰 역할을 했던 발언')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {report.keyMoments.map((moment) => {
            const line = findLine(moment.lineIndex);
            return (
              <button
                key={`${moment.lineIndex}-${moment.label}`}
                type="button"
                disabled={!line}
                onClick={() => onJumpToLine(moment.lineIndex)}
                aria-label={t('{{label}}: 속기록에서 보기', {
                  label: moment.label,
                })}
                className={KEY_MOMENT_CARD_CLASS}
              >
                <span className="flex w-full items-center justify-between">
                  <span className={clsx(CHIP_CLASS, 'bg-brand')}>
                    {moment.label}
                  </span>
                  {line && (
                    <span className="font-mono text-xs text-default-border">
                      {formatOffset(line.offsetMs)}
                    </span>
                  )}
                </span>
                {line && (
                  <>
                    <span className="leading-relaxed font-semibold">
                      “{line.text}”
                    </span>
                    <span
                      className={clsx(
                        'text-sm font-bold',
                        STANCE_TEXT_CLASS[line.stance],
                      )}
                    >
                      {line.speaker ?? ''}
                    </span>
                  </>
                )}
                <span className="mt-auto border-t border-default-dim2 pt-3 text-sm text-default-black2">
                  {moment.reason}
                </span>
              </button>
            );
          })}
        </div>
      </ReportSection>

      <ReportSection number="04" title={t('팀별 좋았던 점 · 아쉬웠던 점')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderFeedback('PROS', report.teamFeedback.pros)}
          {renderFeedback('CONS', report.teamFeedback.cons)}
        </div>
      </ReportSection>
    </div>
  );
}

interface ReportSectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

function ReportSection(props: ReportSectionProps) {
  const { number, title, children } = props;
  return (
    <section className="mt-10 first:mt-4">
      <h2 className="mb-4 flex items-baseline gap-2 text-xl font-bold md:text-subtitle-raw">
        <span className="text-sm font-bold text-semantic-table md:text-base">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

interface FeedbackListProps {
  title: string;
  items: string[];
  mark: '+' | '!';
}

function FeedbackList(props: FeedbackListProps) {
  const { title, items, mark } = props;
  const markClass =
    mark === '+'
      ? 'bg-default-black text-default-white'
      : 'bg-semantic-warning/30 text-semantic-error';
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{title}</p>
      <ul className="space-y-2 text-[15px]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              aria-hidden="true"
              className={clsx(
                'mt-0.5 flex size-5 flex-none items-center justify-center rounded-full text-xs font-bold',
                markClass,
              )}
            >
              {mark}
            </span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
