import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { Suspense } from 'react';
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

  const handleSelectTab = (tab: DashboardTab) => {
    setSearchParams(tab === 'records' ? { [TAB_QUERY_KEY]: tab } : {});
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <DashboardTabs selectedTab={selectedTab} onSelect={handleSelectTab} />
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
