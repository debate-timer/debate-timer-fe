import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  DashboardTab,
  dashboardTabId,
  dashboardTabPanelId,
} from '../dashboardTab';

interface DashboardTabsProps {
  selectedTab: DashboardTab;
  onSelect: (tab: DashboardTab) => void;
}

const NEW_BADGE_CLASS =
  'ml-1.5 inline-flex rounded-full bg-semantic-table px-1.5 text-[11px] leading-5 font-bold text-default-white';

const TAB_CLASS =
  'flex items-center rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap transition md:px-6 md:py-2 md:text-detail-raw';

// 대시보드 헤더에서 시간표와 토론 기록을 전환한다.
export default function DashboardTabs(props: DashboardTabsProps) {
  const { selectedTab, onSelect } = props;
  const { t } = useTranslation();
  const tabs: { key: DashboardTab; label: string }[] = [
    { key: 'tables', label: t('시간표') },
    { key: 'records', label: t('토론 기록') },
  ];

  return (
    <div
      role="tablist"
      aria-label={t('대시보드')}
      className="flex rounded-full bg-default-dim2 p-1"
    >
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          id={dashboardTabId(key)}
          type="button"
          role="tab"
          aria-label={label}
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
          {label}
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
