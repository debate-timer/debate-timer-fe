import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalPortal } from '../../util/GlobalPortal';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TableListPage from './TableListPage';
import userEvent from '@testing-library/user-event';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter>{children}</MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}

describe('TableListPage', () => {
  const renderTableListPage = () => {
    return render(
      <TestWrapper>
        <TableListPage />
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
});
