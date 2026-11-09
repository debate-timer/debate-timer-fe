import { Fragment } from 'react';
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
  PROS: 'border-stance-blue',
  CONS: 'border-stance-red',
  NEUTRAL: 'border-default-neutral',
};

const STANCE_LABEL: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
};

const SPEECH_ROW_CLASS =
  'grid grid-cols-[48px_1fr] gap-3 rounded-[12px] px-2 py-3 md:grid-cols-[64px_1fr] md:px-3';
// 보고서에서 고른 문장으로 이동할 때 상단 고정 탭에 가리지 않도록 여백을 둔다.
const SENTENCE_CLASS =
  'scroll-mt-[160px] rounded-[4px] transition-colors box-decoration-clone';

// 시간표 구간별로 묶은 대본형 속기록. 같은 팀이 이어서 말한 문장은 하나의 발언으로 합쳐 보여준다.
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
          {group.speeches.map((speech) => (
            <div key={speech.key} className={SPEECH_ROW_CLASS}>
              <span className="pt-0.5 font-mono text-xs text-default-neutral md:text-sm">
                {formatOffset(speech.offsetMs)}
              </span>
              <div
                className={clsx(
                  'border-l-[3px] pl-3',
                  STANCE_BORDER_CLASS[speech.stance],
                )}
              >
                <p className="text-sm md:text-[15px]">
                  <span
                    className={clsx(
                      'font-bold',
                      STANCE_TEXT_CLASS[speech.stance],
                    )}
                  >
                    {t(STANCE_LABEL[speech.stance])}
                  </span>
                  {speech.speaker && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span className="font-semibold">{speech.speaker}</span>
                    </>
                  )}
                </p>
                <p className="mt-1 leading-relaxed md:text-[17px]">
                  {speech.lines.map((line, position) => (
                    <Fragment key={line.index}>
                      {position > 0 && ' '}
                      <span
                        id={`transcript-line-${line.index}`}
                        className={clsx(
                          SENTENCE_CLASS,
                          highlightedLineIndex === line.index && 'bg-brand/40',
                        )}
                      >
                        {line.text}
                      </span>
                    </Fragment>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
