import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GlobalPortal } from '../../util/GlobalPortal';
import TableComposition from './TableComposition';

// ------------------
// 테스트 래퍼 (TestWrapper)
// ------------------
function TestWrapper({
  children,
  initialEntries = ['/composition?mode=add'],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            {/* TableComposition 테스트 경로 */}
            <Route path="/composition" element={children} />

            {/* 실제로 이동하고 싶은 /overview 경로 - 테스트용 컴포넌트 */}
            <Route
              path="/overview/customize/1"
              element={<h1 data-testid="overview-page">Overview Page</h1>}
            />
          </Routes>
        </MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}

vi.mock('./components/DebatePanel/DebatePanel', () => {
  const DebatePanel = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="timebox">{children}</div>
  );

  return {
    default: DebatePanel,
  };
});

/**
 * # Test list
 * - (add) Cration flow
 * - (edit) Modification flow
 */

describe('TableComposition', () => {
  beforeEach(() => {
    // 세션스토리지 초기화 등 필요한 작업
    sessionStorage.clear();
  });

  it('Creation flow and timebox functionality test', async () => {
    render(
      <TestWrapper initialEntries={['/composition?mode=add']}>
        <TableComposition />
      </TestWrapper>,
    );

    // Check header title is exist to verify whether TablenameAndType is correctly rendered
    expect(screen.findByRole('heading', { name: '토론 정보를 설정해주세요' }));

    // Go to next step - TimeBoxStep
    await userEvent.click(await screen.findByRole('button', { name: '다음' }));
    expect(screen.findByRole('heading', { name: '주제 없음' }));

    // Check whether finish button is disabled
    const finishButton = await screen.findByRole('button', {
      name: '추가하기',
    });
    expect(finishButton).toBeDisabled();

    // Add a new timebox
    await userEvent.click(await screen.findByRole('button', { name: '+' }));
    await userEvent.click(
      await screen.findByRole('button', { name: '설정 완료' }),
    );
    expect(screen.getByTestId('timebox')).toBeInTheDocument();

    // Finish creation flow
    await userEvent.click(finishButton);
    expect(screen.getByTestId('overview-page')).toBeInTheDocument();
  });

  it('Modification flow test', async () => {
    render(
      <TestWrapper
        initialEntries={['/composition?mode=edit&tableId=1&mode=CUSTOMIZE']}
      >
        <TableComposition />
      </TestWrapper>,
    );

    // Check whether user sees TimeBoxStep not TableNameAndType
    expect(screen.findByRole('button', { name: '토론 정보 수정하기' }));

    // Check whether timeboxes are correctly displayed
    const timeboxItems = await screen.findAllByTestId('timebox');
    expect(timeboxItems.length).toBeGreaterThan(0);

    // Check whether table info change button works well
    await userEvent.click(
      await screen.findByRole('button', { name: '토론 정보 수정하기' }),
    );
    expect(screen.getByText('토론 정보를 수정해주세요')).toBeInTheDocument();
  });
});
