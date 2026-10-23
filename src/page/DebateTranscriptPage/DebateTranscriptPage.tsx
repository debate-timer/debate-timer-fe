import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import { useGetTranscript } from '../../hooks/query/useGetTranscript';
import TranscriptView from './components/TranscriptView';
import ReportView from './components/ReportView';
import TranscriptGenerating from './components/TranscriptGenerating';
import { SttMode } from '../../types/transcript';

type DetailTab = 'transcript' | 'report';

const TAB_CLASS =
  'flex flex-1 items-center justify-center rounded-[18px] border-2 px-4 py-3 font-bold transition md:text-detail-raw';
const STATUS_BOX_CLASS =
  'mt-6 flex flex-col items-center gap-2 rounded-[20px] bg-default-dim2 p-10 text-center';

// 토론 종료 후 만들어진 속기록과 AI 분석 보고서를 보여주는 화면이다.
export default function DebateTranscriptPage() {
  const { t } = useTranslation();
  const { transcriptId: rawTranscriptId } = useParams();
  const transcriptId = Number(rawTranscriptId);
  const isIdValid = Number.isInteger(transcriptId) && transcriptId > 0;
  const { data, isLoading, isError, refetch } = useGetTranscript(
    transcriptId,
    isIdValid,
  );
  const [tab, setTab] = useState<DetailTab>('transcript');
  const [highlightedLineIndex, setHighlightedLineIndex] = useState<
    number | null
  >(null);

  // 보고서에서 고른 발언으로 이동해 잠시 강조한다.
  useEffect(() => {
    if (tab !== 'transcript' || highlightedLineIndex === null) {
      return;
    }
    document
      .getElementById(`transcript-line-${highlightedLineIndex}`)
      ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    const timer = setTimeout(() => setHighlightedLineIndex(null), 2000);
    return () => clearTimeout(timer);
  }, [tab, highlightedLineIndex]);

  const handleJumpToLine = (lineIndex: number) => {
    setTab('transcript');
    setHighlightedLineIndex(lineIndex);
  };

  if (!isIdValid) {
    throw new Error(t('토론 기록 ID가 올바르지 않습니다.'));
  }

  const renderTab = (key: DetailTab, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      aria-label={label}
      onClick={() => setTab(key)}
      className={clsx(
        TAB_CLASS,
        tab === key
          ? 'border-default-black bg-default-black text-default-white'
          : 'border-default-disabled/hover bg-default-white hover:border-brand',
      )}
    >
      {label}
    </button>
  );

  // 속기록은 AI가 STT 원문을 보정한 결과다. 보정에 실패하면 서버가 원문을 준다.
  const renderTranscript = () => {
    if (!data) {
      return null;
    }
    return (
      <TranscriptView
        lines={data.lines}
        highlightedLineIndex={highlightedLineIndex}
      />
    );
  };

  const renderReport = () => {
    if (!data) {
      return null;
    }
    if (data.status === 'FAILED' || !data.report) {
      return (
        <div className={STATUS_BOX_CLASS}>
          <p className="font-bold">{t('분석 보고서를 만들지 못했어요')}</p>
          {data.errorMessage && (
            <p className="text-sm text-default-border">{data.errorMessage}</p>
          )}
        </div>
      );
    }
    return (
      <ReportView
        report={data.report}
        lines={data.lines}
        onJumpToLine={handleJumpToLine}
      />
    );
  };

  const isGenerating =
    !!data && (data.refining || data.status === 'PROCESSING');

  const sttModeLabels: Record<SttMode, string> = {
    RPC: t('실시간 인식 (크롬)'),
    SONIOX: t('발언 후 일괄 인식 (Soniox)'),
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <HeaderTitle title={t('토론 기록')} />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        {isLoading && <LoadingIndicator />}
        {isError && <ErrorIndicator onClickRetry={() => refetch()} />}
        {/* 보정·분석이 끝나기 전에는 내용 대신 진행 단계만 보여준다. */}
        {data && isGenerating && (
          <TranscriptGenerating
            tableName={data.tableName}
            agenda={data.agenda}
            refining={data.refining}
          />
        )}
        {data && !isGenerating && (
          <div className="mx-auto w-full max-w-[1140px] pb-16">
            <p className="text-sm text-default-border">
              {data.tableName}
              <span className="ml-2 rounded-full bg-default-neutral px-2 py-0.5 text-xs font-semibold text-default-black2">
                {t('음성 인식: {{mode}}', {
                  mode: sttModeLabels[data.sttMode],
                })}
              </span>
            </p>
            <h1 className="mt-1 text-2xl leading-tight font-bold md:text-[32px]">
              {data.agenda}
            </h1>

            <div
              role="tablist"
              aria-label={t('기록 보기 방식')}
              className="sticky top-0 z-10 mt-6 flex gap-2 bg-default-white py-3 md:gap-3"
            >
              {renderTab('transcript', t('속기록'))}
              {renderTab('report', t('분석 보고서'))}
            </div>

            <div className="pt-2">
              {tab === 'transcript' ? renderTranscript() : renderReport()}
            </div>
          </div>
        )}
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
