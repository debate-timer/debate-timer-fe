import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import { useGetTranscript } from '../../hooks/query/useGetTranscript';
import TranscriptDetail from '../../components/TranscriptDetail/TranscriptDetail';
import TranscriptGenerating from '../../components/TranscriptDetail/TranscriptGenerating';
import { SttMode } from '../../types/transcript';
import DTShare from '../../components/icons/Share';
import useTranscriptShare from './hooks/useTranscriptShare';
import TranscriptShareModal from './components/TranscriptShareModal';

const SHARE_BUTTON_CLASS =
  'flex size-11 flex-none items-center justify-center rounded-full bg-default-white p-3 text-default-black transition hover:bg-brand';

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
  const {
    ModalWrapper,
    shareUrl,
    isCopied,
    isShareLoading,
    isShareError,
    isUnsharing,
    isUnshareError,
    handleOpenShare,
    handleRetryShare,
    handleCopy,
    handleUnshare,
  } = useTranscriptShare(transcriptId);

  if (!isIdValid) {
    throw new Error(t('토론 기록 ID가 올바르지 않습니다.'));
  }

  const isGenerating =
    !!data && (data.refining || data.status === 'PROCESSING');

  const sttModeLabels: Record<SttMode, string> = {
    RPC: t('실시간 인식 (크롬)'),
    SONIOX: t('발언 후 일괄 인식 (Soniox)'),
  };

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <div className="mb-4 w-full max-w-4xl">
          <HeaderTitle title={t('토론 기록')} />
        </div>
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
          <TranscriptDetail
            tableName={data.tableName}
            agenda={data.agenda}
            status={data.status}
            lines={data.lines}
            report={data.report}
            errorMessage={data.errorMessage}
            headerAction={
              <button
                type="button"
                aria-label={t('공유하기')}
                title={t('공유하기')}
                onClick={handleOpenShare}
                className={SHARE_BUTTON_CLASS}
              >
                <DTShare className="h-full" />
              </button>
            }
            badge={
              <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-default-black">
                {t('음성 인식: {{mode}}', {
                  mode: sttModeLabels[data.sttMode],
                })}
              </span>
            }
          />
        )}
      </DefaultLayout.ContentContainer>

      <ModalWrapper>
        <TranscriptShareModal
          shareUrl={shareUrl}
          isCopied={isCopied}
          isLoading={isShareLoading}
          isError={isShareError}
          isUnsharing={isUnsharing}
          isUnshareError={isUnshareError}
          onRetry={handleRetryShare}
          onCopy={handleCopy}
          onUnshare={handleUnshare}
        />
      </ModalWrapper>
    </DefaultLayout>
  );
}
