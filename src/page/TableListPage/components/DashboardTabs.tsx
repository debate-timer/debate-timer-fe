import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  DashboardTab,
  dashboardTabId,
  dashboardTabPanelId,
} from '../dashboardTab';

interface DashboardTabsProps {
  // 보여줄 탭. 피쳐 플래그가 없는 탭은 빼고 넘긴다.
  tabs: DashboardTab[];
  // 어느 탭을 보여줄지 정해지기 전에는 null 로 두어 아무 탭도 선택하지 않는다.
  selectedTab: DashboardTab | null;
  onSelect: (tab: DashboardTab) => void;
}

const NEW_BADGE_CLASS =
  'ml-1.5 inline-flex rounded-full bg-semantic-table px-1.5 text-[11px] leading-5 font-bold text-default-white';

const TAB_CLASS =
  'flex items-center rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap transition md:px-6 md:py-2 md:text-detail-raw';

// 대시보드 헤더에서 시간표와 토론 기록을 전환한다.
export default function DashboardTabs(props: DashboardTabsProps) {
  const { tabs, selectedTab, onSelect } = props;
  const { t } = useTranslation();
  const labels: Record<DashboardTab, string> = {
    tables: t('시간표'),
    records: t('토론 기록'),
  };

  return (
    <div
      role="tablist"
      aria-label={t('대시보드')}
      className="flex rounded-full bg-default-dim2 p-1"
    >
      {tabs.map((key) => (
        <button
          key={key}
          id={dashboardTabId(key)}
          type="button"
          role="tab"
          aria-label={labels[key]}
          aria-selected={selectedTab === key}
          aria-controls={dashboardTabPanelId(key)}
          onClick={() => onSelect(key)}
          className={clsx(
            TAB_CLASS,
            selectedTab === key
              ? 'bg-default-black text-default-white'
              : 'text-default-black2 hover:bg-default-white',
          )}
        >
          {labels[key]}
          {/* 새로 생긴 기능이라 토론 기록 탭에는 항상 New 태그를 붙인다. */}
          {key === 'records' && (
            <span aria-hidden="true" className={NEW_BADGE_CLASS}>
              New
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
