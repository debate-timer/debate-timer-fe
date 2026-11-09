import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { Suspense } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import TableListPageContent from './components/TableListPageContent';
import TranscriptListContent from './components/TranscriptListContent';
import DashboardTabs from './components/DashboardTabs';
import {
  DashboardTab,
  dashboardTabId,
  dashboardTabPanelId,
} from './dashboardTab';
import UpdateModalWrapper from '../../components/UpdateModal/UpdateModalWrapper';
import useFeatureFlag from '../../hooks/useFeatureFlag';

const TAB_QUERY_KEY = 'tab';

export default function TableListPage() {
  const { t } = useTranslation();
  // 탭을 주소에 남겨 뒤로 가기·새로고침에도 같은 탭을 보여준다.
  const [searchParams, setSearchParams] = useSearchParams();
  // 토론 기록 탭은 피쳐 플래그(TRANSCRIPT)를 부여받은 회원에게만 보여준다.
  const { isEnabled: hasTranscriptFlag, isLoading: isFlagLoading } =
    useFeatureFlag('TRANSCRIPT');
  const availableTabs: DashboardTab[] = hasTranscriptFlag
    ? ['tables', 'records']
    : ['tables'];
  const isRecordsRequested = searchParams.get(TAB_QUERY_KEY) === 'records';
  // 주소로 토론 기록 탭을 열었으면 플래그를 받을 때까지 시간표로 바꾸지 않고 기다린다.
  const isTabPending = isRecordsRequested && isFlagLoading;
  const selectedTab: DashboardTab =
    hasTranscriptFlag && isRecordsRequested ? 'records' : 'tables';

  const handleSelectTab = (tab: DashboardTab) => {
    setSearchParams(tab === 'records' ? { [TAB_QUERY_KEY]: tab } : {});
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <DashboardTabs
            tabs={availableTabs}
            selectedTab={isTabPending ? null : selectedTab}
            onSelect={handleSelectTab}
          />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        {isTabPending && <LoadingIndicator />}
        {/* 탭마다 패널을 두고 선택하지 않은 패널은 숨긴다. 내용은 선택한 탭만 그려 불필요한 조회를 막는다. */}
        <div
          role="tabpanel"
          id={dashboardTabPanelId('tables')}
          aria-labelledby={dashboardTabId('tables')}
          hidden={isTabPending || selectedTab !== 'tables'}
        >
          {!isTabPending && selectedTab === 'tables' && (
            <Suspense fallback={<LoadingIndicator />}>
              <p className="m-5 mb-0 text-xl font-semibold md:text-subtitle-raw">
                {t('토론 시간표를 선택해주세요')}
              </p>
              <TableListPageContent />
            </Suspense>
          )}
        </div>
        {hasTranscriptFlag && (
          <div
            role="tabpanel"
            id={dashboardTabPanelId('records')}
            aria-labelledby={dashboardTabId('records')}
            hidden={selectedTab !== 'records'}
          >
            {selectedTab === 'records' && <TranscriptListContent />}
          </div>
        )}

        {/* 업데이트 안내는 탭과 상관없이 대시보드에 들어오면 보여준다. */}
        <Suspense>
          <UpdateModalWrapper />
        </Suspense>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
