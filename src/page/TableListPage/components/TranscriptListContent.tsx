import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useGetTranscripts } from '../../../hooks/query/useGetTranscripts';
import { TranscriptSummary } from '../../../apis/responses/transcript';
import LoadingIndicator from '../../../components/LoadingIndicator/LoadingIndicator';
import ErrorIndicator from '../../../components/ErrorIndicator/ErrorIndicator';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';

// 노란 시간표 카드와 구분되도록 기본블랙(차콜) 카드에 테마 노랑으로 강조한다.
const CARD_CLASS =
  'm-5 flex h-[220px] w-[340px] flex-col gap-3 rounded-[28px] border-2 p-6 text-left text-default-white shadow-lg transition-all duration-300 hover:-translate-y-1';
const GENERATING_CHIP_CLASS =
  'flex flex-none items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-default-black';

// 생성 시각을 "10.23 (목) 01:39"처럼 보여준다.
function formatCreatedAt(createdAt: string, lang: string): string {
  const date = new Date(createdAt);
  const weekday = date.toLocaleDateString(lang, { weekday: 'short' });
  const time = date.toLocaleTimeString(lang, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${date.getMonth() + 1}.${date.getDate()} (${weekday}) ${time}`;
}

function isGenerating(transcript: TranscriptSummary): boolean {
  return transcript.refining || transcript.status === 'PROCESSING';
}

// 대시보드 토론 기록 탭. 서버가 준 최근 생성순으로 보여준다.
export default function TranscriptListContent() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const { data, isLoading, isError, refetch } = useGetTranscripts(true);

  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (isError || !data) {
    return <ErrorIndicator onClickRetry={() => refetch()} />;
  }

  return (
    <div className="pb-16">
      <p className="m-5 mb-0 text-xl font-semibold md:text-subtitle-raw">
        {t('토론 기록')}
      </p>
      <p className="mx-5 mt-1 text-sm text-default-border md:text-base">
        {t(
          '타이머로 진행한 토론이 끝날 때마다 속기록과 분석 보고서가 자동으로 쌓여요.',
        )}
      </p>

      {data.transcripts.length === 0 && (
        <div className="m-5 flex h-[220px] w-[340px] flex-col items-center justify-center gap-2 rounded-[28px] bg-default-dim2 p-6 text-center">
          <p className="font-semibold">{t('아직 토론 기록이 없어요')}</p>
          <p className="text-sm text-default-border">
            {t('타이머 화면에서 녹음을 켜고 토론을 진행해 보세요.')}
          </p>
        </div>
      )}

      {/* 시간표 탭처럼 주제 길이와 상관없이 같은 크기의 카드를 줄 바꿈으로 놓는다. */}
      <div className="flex max-w-[1140px] flex-wrap justify-start">
        {data.transcripts.map((transcript) => {
          const generating = isGenerating(transcript);
          return (
            <Link
              key={transcript.id}
              to={buildLangPath(
                `/table/customize/${transcript.tableId}/end/transcript/${transcript.id}`,
                lang,
              )}
              className={clsx(
                CARD_CLASS,
                generating
                  ? 'border-dashed border-brand/70 bg-default-black2'
                  : 'border-transparent bg-default-black hover:bg-neutral-800',
              )}
            >
              <span className="flex w-full items-center justify-between gap-2 text-sm text-neutral-300">
                <span className="truncate">
                  {transcript.tableName ?? t('삭제된 시간표')}
                </span>
                {generating && (
                  <span className={GENERATING_CHIP_CLASS}>
                    <span
                      aria-hidden="true"
                      className="size-2 animate-pulse rounded-full bg-default-black"
                    />
                    {t('생성 중')}
                  </span>
                )}
              </span>
              <span className="size-[10px] flex-none bg-brand" />
              <span className="line-clamp-2 text-xl leading-snug font-bold">
                {transcript.agenda ?? t('주제를 알 수 없어요')}
              </span>
              <span className="mt-auto text-sm font-semibold text-neutral-300">
                {formatCreatedAt(transcript.createdAt, lang)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
