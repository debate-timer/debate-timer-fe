import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { Suspense, useEffect, useState } from 'react';
import { useGetTranscripts } from '../../hooks/query/useGetTranscripts';
import {
  getTranscriptListSeenAt,
  hasUnseenTranscripts,
  markTranscriptListSeen,
} from '../../util/transcriptListSeen';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import TableListPageContent from './components/TableListPageContent';
import TranscriptListContent from './components/TranscriptListContent';
import DashboardTabs, { DashboardTab } from './components/DashboardTabs';
import UpdateModalWrapper from '../../components/UpdateModal/UpdateModalWrapper';

const TAB_QUERY_KEY = 'tab';

export default function TableListPage() {
  const { t } = useTranslation();
  // 탭을 주소에 남겨 뒤로 가기·새로고침에도 같은 탭을 보여준다.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab: DashboardTab =
    searchParams.get(TAB_QUERY_KEY) === 'records' ? 'records' : 'tables';

  // 탭 N 표시를 위해 시간표 탭에서도 토론 기록 목록을 가져온다. 목록 탭과 같은 캐시를 쓴다.
  const { data: transcriptList } = useGetTranscripts(true);
  const [seenAt, setSeenAt] = useState(() => getTranscriptListSeenAt());
  const hasNewRecords =
    selectedTab !== 'records' &&
    !!transcriptList &&
    hasUnseenTranscripts(transcriptList.transcripts, seenAt);

  // 토론 기록 탭에서 목록을 받으면 본 것으로 기록한다.
  useEffect(() => {
    if (selectedTab !== 'records' || !transcriptList) {
      return;
    }
    markTranscriptListSeen(transcriptList.transcripts);
    setSeenAt(getTranscriptListSeenAt());
  }, [selectedTab, transcriptList]);

  const handleSelectTab = (tab: DashboardTab) => {
    setSearchParams(tab === 'records' ? { [TAB_QUERY_KEY]: tab } : {});
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <DashboardTabs
            selectedTab={selectedTab}
            onSelect={handleSelectTab}
            hasNewRecords={hasNewRecords}
          />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        {selectedTab === 'records' ? (
          <TranscriptListContent />
        ) : (
          <Suspense fallback={<LoadingIndicator />}>
            <p className="m-5 mb-0 text-xl font-semibold md:text-subtitle-raw">
              {t('토론 시간표를 선택해주세요')}
            </p>
            <TableListPageContent />
          </Suspense>
        )}

        {/* 업데이트 안내는 탭과 상관없이 대시보드에 들어오면 보여준다. */}
        <Suspense>
          <UpdateModalWrapper />
        </Suspense>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
