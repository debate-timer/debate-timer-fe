export type DashboardTab = 'tables' | 'records';

// 탭과 탭 패널을 aria-controls·aria-labelledby로 잇는 id
export function dashboardTabId(tab: DashboardTab): string {
  return `dashboard-tab-${tab}`;
}

export function dashboardTabPanelId(tab: DashboardTab): string {
  return `dashboard-tabpanel-${tab}`;
}
