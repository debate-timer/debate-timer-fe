import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Stance } from '../../../types/type';
import { TranscriptLine } from '../../../types/transcript';
import { formatOffset, groupTranscriptLines } from '../transcriptFormatting';
import { STANCE_TEXT_CLASS } from '../stanceStyle';

interface TranscriptViewProps {
  lines: TranscriptLine[];
  highlightedLineIndex: number | null;
}

const STANCE_BORDER_CLASS: Record<Stance, string> = {
  PROS: 'border-camp-blue',
  CONS: 'border-camp-red',
  NEUTRAL: 'border-default-neutral',
};

const STANCE_LABEL: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
};

const LINE_ROW_CLASS =
  'grid scroll-mt-[160px] grid-cols-[48px_1fr] gap-3 rounded-[12px] px-2 py-3 transition-colors md:grid-cols-[64px_1fr] md:px-3';

// 시간표 구간별로 묶은 대본형 속기록. 각 줄에 경과 시간, 화자, 발언을 보여준다.
export default function TranscriptView(props: TranscriptViewProps) {
  const { lines, highlightedLineIndex } = props;
  const { t } = useTranslation();
  const groups = groupTranscriptLines(lines);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="mb-1 flex items-center gap-3 rounded-[12px] bg-default-dim2 px-3 py-2.5">
            <span className="font-bold md:text-detail-raw">
              {t(group.speechType)}
            </span>
            <span className="ml-auto text-sm text-default-border">
              {formatOffset(group.startOffsetMs)}
            </span>
          </div>
          {group.lines.map((line) => (
            <div
              key={line.index}
              id={`transcript-line-${line.index}`}
              className={clsx(
                LINE_ROW_CLASS,
                highlightedLineIndex === line.index && 'bg-brand/40',
              )}
            >
              <span className="pt-0.5 font-mono text-xs text-default-neutral md:text-sm">
                {formatOffset(line.offsetMs)}
              </span>
              <div
                className={clsx(
                  'border-l-[3px] pl-3',
                  STANCE_BORDER_CLASS[line.stance],
                )}
              >
                <p className="text-sm md:text-[15px]">
                  <span
                    className={clsx(
                      'font-bold',
                      STANCE_TEXT_CLASS[line.stance],
                    )}
                  >
                    {t(STANCE_LABEL[line.stance])}
                  </span>
                  {line.speaker && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span className="font-semibold">{line.speaker}</span>
                    </>
                  )}
                </p>
                <p className="mt-1 leading-relaxed md:text-[17px]">
                  {line.text}
                </p>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
