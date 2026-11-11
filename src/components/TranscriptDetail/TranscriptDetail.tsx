import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  DebateReport,
  TranscriptLine,
  TranscriptStatus,
} from '../../types/transcript';
import TranscriptHeaderCard from './TranscriptHeaderCard';
import TranscriptView from './TranscriptView';
import ReportView from './ReportView';

interface TranscriptDetailProps {
  tableName: string;
  agenda: string;
  status: TranscriptStatus;
  lines: TranscriptLine[];
  report: DebateReport | null;
  // 분석 실패 사유. 보여주지 않을 화면에서는 null을 넘긴다.
  errorMessage: string | null;
  // 시간표 이름 옆에 붙는 칩(인식 방식 등)
  badge?: ReactNode;
  // 기록 카드 오른쪽 위에 놓는 버튼(공유 등)
  headerAction?: ReactNode;
}

type DetailTab = 'transcript' | 'report';

const TAB_CLASS =
  'flex flex-1 items-center justify-center rounded-[18px] border-2 px-4 py-3 font-bold transition md:text-detail-raw';
const STATUS_BOX_CLASS =
  'mt-6 flex flex-col items-center gap-2 rounded-[20px] bg-default-dim2 p-10 text-center';

/**
 * 보정·분석이 끝난 토론 기록을 속기록·분석 보고서 탭으로 보여준다.
 * 보고서에서 발언을 고르면 속기록 탭으로 이동해 해당 발언을 잠시 강조한다.
 */
export default function TranscriptDetail(props: TranscriptDetailProps) {
  const {
    tableName,
    agenda,
    status,
    lines,
    report,
    errorMessage,
    badge,
    headerAction,
  } = props;
  const { t } = useTranslation();
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

  const renderReport = () => {
    if (status === 'FAILED' || !report) {
      return (
        <div className={STATUS_BOX_CLASS}>
          <p className="font-bold">{t('분석 보고서를 만들지 못했어요')}</p>
          {errorMessage && (
            <p className="text-sm text-default-border">{errorMessage}</p>
          )}
        </div>
      );
    }
    return (
      <ReportView
        report={report}
        lines={lines}
        onJumpToLine={handleJumpToLine}
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1140px] pb-16">
      <TranscriptHeaderCard
        tableName={tableName}
        agenda={agenda}
        badge={badge}
        action={headerAction}
      />

      <div
        role="tablist"
        aria-label={t('기록 보기 방식')}
        className="sticky top-0 z-10 mt-6 flex gap-2 bg-default-white py-3 md:gap-3"
      >
        {renderTab('transcript', t('속기록'))}
        {renderTab('report', t('분석 보고서'))}
      </div>

      <div className="pt-2">
        {/* 속기록은 AI가 STT 원문을 보정한 결과다. 보정에 실패하면 서버가 원문을 준다. */}
        {tab === 'transcript' ? (
          <TranscriptView
            lines={lines}
            highlightedLineIndex={highlightedLineIndex}
          />
        ) : (
          renderReport()
        )}
      </div>
    </div>
  );
}
