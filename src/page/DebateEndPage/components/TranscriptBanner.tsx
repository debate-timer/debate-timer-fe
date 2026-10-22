import { useTranslation } from 'react-i18next';
import { RiArrowRightLine, RiMicFill } from 'react-icons/ri';
import clsx from 'clsx';
import { SubmitTranscriptStatus } from '../hooks/useSubmitTranscript';

interface TranscriptBannerProps {
  status: SubmitTranscriptStatus;
  // Soniox 모드에서 아직 전사 중인 구간 수
  pendingCount?: number;
  onOpen: () => void;
  onRetry: () => void;
}

const BANNER_CLASS =
  'flex w-full max-w-[680px] items-center gap-4 rounded-[24px] border-2 bg-default-white p-4 text-left md:p-5';
const ACTION_CLASS =
  'flex flex-none items-center gap-1 rounded-full bg-default-black px-4 py-2 text-sm font-bold text-default-white';

// 토론 종료 화면에서 토론 기록의 전송 상태를 알리고 결과 화면으로 안내한다.
export default function TranscriptBanner(props: TranscriptBannerProps) {
  const { status, pendingCount = 0, onOpen, onRetry } = props;
  const { t } = useTranslation();

  if (status === 'none') {
    return null;
  }

  const messages: Record<Exclude<SubmitTranscriptStatus, 'none'>, string> = {
    transcribing: t('발언을 텍스트로 바꾸고 있어요 ({{count}}개 구간 남음)', {
      count: pendingCount,
    }),
    submitting: t('토론 기록을 보내고 있어요'),
    ready: t('이번 토론이 자동으로 기록됐어요'),
    error: t('토론 기록을 보내지 못했어요'),
  };

  return (
    <div
      className={clsx(
        BANNER_CLASS,
        status === 'error'
          ? 'border-semantic-warning'
          : 'border-brand shadow-[0px_0px_22px_6px_#FECD4C40]',
      )}
    >
      <span className="flex size-12 flex-none items-center justify-center rounded-full bg-brand">
        <RiMicFill
          className={clsx(
            'size-6',
            (status === 'submitting' || status === 'transcribing') &&
              'animate-pulse',
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold md:text-detail-raw">
          {messages[status]}
        </span>
        <span className="block text-sm text-default-border md:text-base">
          {t('찬·반 화자가 구분된 속기록과 AI 분석 보고서를 볼 수 있어요')}
        </span>
      </span>
      {status === 'ready' && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={t('속기록·분석 보고서 보기')}
          className={ACTION_CLASS}
        >
          <span className="hidden md:inline">{t('보기')}</span>
          <RiArrowRightLine className="size-5" />
        </button>
      )}
      {status === 'error' && (
        <button
          type="button"
          onClick={onRetry}
          aria-label={t('다시 보내기')}
          className={ACTION_CLASS}
        >
          {t('다시 보내기')}
        </button>
      )}
    </div>
  );
}
