import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import TranscriptDetail from '../../components/TranscriptDetail/TranscriptDetail';
import TranscriptGenerating from '../../components/TranscriptDetail/TranscriptGenerating';
import useGetSharedTranscript from '../../hooks/query/useGetSharedTranscript';

// 공유 링크를 받은 사람이 로그인 없이 속기록과 분석 보고서를 보는 화면이다.
export default function SharedTranscriptPage() {
  const { t } = useTranslation();
  const { shareToken = '' } = useParams();
  const { data, isLoading, isError, refetch } = useGetSharedTranscript(
    shareToken,
    shareToken !== '',
  );

  const isGenerating =
    !!data && (data.refining || data.status === 'PROCESSING');

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <HeaderTitle title={t('공유된 토론 기록')} />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        {isLoading && <LoadingIndicator />}
        {isError && (
          <ErrorIndicator onClickRetry={() => refetch()}>
            {t(
              '토론 기록을 불러오지 못했어요.\n공유가 중지됐거나 잘못된 링크일 수 있어요.',
            )}
          </ErrorIndicator>
        )}
        {data && isGenerating && (
          <TranscriptGenerating
            tableName={data.tableName}
            agenda={data.agenda}
            refining={data.refining}
            showRecordsLink={false}
          />
        )}
        {/* 공유 응답에는 분석 실패 사유가 없다. */}
        {data && !isGenerating && (
          <TranscriptDetail
            tableName={data.tableName}
            agenda={data.agenda}
            status={data.status}
            lines={data.lines}
            report={data.report}
            errorMessage={null}
          />
        )}
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
