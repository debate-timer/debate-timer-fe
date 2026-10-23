import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalPortal } from '../../util/GlobalPortal';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import TableListPage from './TableListPage';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';

function TestWrapper({
  children,
  initialEntry = '/home',
}: {
  children: React.ReactNode;
  initialEntry?: string;
}) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}

describe('TableListPage', () => {
  const renderTableListPage = () => {
    return render(
      <TestWrapper>
        <Suspense>
          <TableListPage />
        </Suspense>
      </TestWrapper>,
    );
  };

  it('테이블 추가 버튼 렌더링 검증', async () => {
    renderTableListPage();

    // 테이블 추가 버튼 표시되는지 확인
    await waitFor(() => expect(screen.getByText('+')).toBeInTheDocument());
  });

  it('테이블 아이템 렌더링 검증', async () => {
    renderTableListPage();

    await waitFor(async () => {
      // 테이블 1개 이상 존재하는지 확인
      const tableItem = screen.getAllByTestId('table');
      expect(tableItem.length).toBeGreaterThan(0);

      // 수정 버튼 및 삭제 버튼 존재하는지 확인
      const deleteButton = tableItem[0].querySelector(
        '[aria-label="삭제하기"]',
      );
      expect(deleteButton).toBeInTheDocument();
      expect(
        tableItem[0].querySelector('[aria-label="수정하기"]'),
      ).toBeInTheDocument();

      // 삭제 버튼 클릭 시 모달 열리는지 확인
      await userEvent.click(deleteButton!);
      expect(
        screen.getByText('테이블을 삭제하시겠습니까?'),
      ).toBeInTheDocument();

      // 취소 버튼 클릭 시 모달 닫히는지 확인
      await userEvent.click(screen.getByText('취소'));
      expect(
        screen.queryByText('테이블을 삭제하시겠습니까?'),
      ).not.toBeInTheDocument();
    });
  });

  describe('시간표·토론 기록 탭', () => {
    const renderAt = (initialEntry: string) =>
      render(
        <TestWrapper initialEntry={initialEntry}>
          <Suspense>
            <TableListPage />
          </Suspense>
        </TestWrapper>,
      );

    it('토론 기록 탭에는 탭을 연 적이 있어도 New 태그를 계속 붙인다', async () => {
      const user = userEvent.setup();
      renderAt('/home');

      const recordsTab = await screen.findByRole('tab', { name: '토론 기록' });
      expect(within(recordsTab).getByText('New')).toBeInTheDocument();

      await user.click(recordsTab);
      await screen.findByText('노동시장 유연화를 확대해야 한다');
      await user.click(screen.getByRole('tab', { name: '시간표' }));

      expect(
        within(screen.getByRole('tab', { name: '토론 기록' })).getByText('New'),
      ).toBeInTheDocument();
    });

    it('각 탭이 자기 탭 패널을 가리키고, 선택하지 않은 탭의 패널은 숨긴다', async () => {
      renderAt('/home');

      const tablesTab = await screen.findByRole('tab', { name: '시간표' });
      const recordsTab = screen.getByRole('tab', { name: '토론 기록' });
      const tablesPanel = document.getElementById(
        tablesTab.getAttribute('aria-controls') ?? '',
      );
      const recordsPanel = document.getElementById(
        recordsTab.getAttribute('aria-controls') ?? '',
      );

      expect(tablesPanel).toHaveAttribute('role', 'tabpanel');
      expect(recordsPanel).toHaveAttribute('role', 'tabpanel');
      expect(tablesPanel).not.toBe(recordsPanel);
      expect(tablesPanel).toHaveAttribute('aria-labelledby', tablesTab.id);
      expect(recordsPanel).toHaveAttribute('aria-labelledby', recordsTab.id);
      expect(tablesPanel).not.toHaveAttribute('hidden');
      expect(recordsPanel).toHaveAttribute('hidden');
    });

    it('처음에는 시간표 탭을 보여준다', async () => {
      renderAt('/home');

      expect(
        await screen.findByRole('tab', { name: '시간표' }),
      ).toHaveAttribute('aria-selected', 'true');
      await waitFor(() => expect(screen.getByText('+')).toBeInTheDocument());
    });

    it('토론 기록 탭을 누르면 토론 기록 목록을 보여준다', async () => {
      const user = userEvent.setup();
      renderAt('/home');

      await user.click(await screen.findByRole('tab', { name: '토론 기록' }));

      expect(screen.getByRole('tab', { name: '토론 기록' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(
        await screen.findByText('노동시장 유연화를 확대해야 한다'),
      ).toBeInTheDocument();
      expect(screen.queryByText('+')).not.toBeInTheDocument();
    });

    it('주소에 토론 기록 탭이 지정돼 있으면 토론 기록 목록으로 시작한다', async () => {
      renderAt('/home?tab=records');

      expect(
        await screen.findByText('노동시장 유연화를 확대해야 한다'),
      ).toBeInTheDocument();
    });
  });
});
