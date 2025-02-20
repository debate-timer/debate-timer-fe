import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { GlobalPortal } from '../../util/GlobalPortal';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import TimerPage from './TimerPage';
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

describe('TimerPage', () => {
  const renderTimerPage = () => {
    return render(
      <TestWrapper>
        <TimerPage />
      </TestWrapper>,
    );
  };

  it('일반 타이머 사용 시 렌더링 검증', async () => {
    renderTimerPage();

    // 타이머가 표시되는지 확인
    await waitFor(() =>
      expect(screen.getByTestId('timer')).toBeInTheDocument(),
    );

    // 타이머 조작부가 표시되는지 확인
    await waitFor(() =>
      expect(screen.getByTestId('timer-controller')).toBeInTheDocument(),
    );

    // 시간표가 표시되는지 확인
    await waitFor(() =>
      expect(screen.getByTestId('time-table')).toBeInTheDocument(),
    );

    // 시간표의 각 아이템들이 1개 이상 표시되는지 확인 (msw 핸들러의 응답 기준)
    await waitFor(() =>
      expect(screen.getAllByTestId('time-table-item').length).toBeGreaterThan(
        0,
      ),
    );
  });

  it('작전 시간 타이머 동작 검증', async () => {
    renderTimerPage();

    // 추가 작전 시간 버튼 존재하는지 확인
    await waitFor(() =>
      expect(screen.getByTestId('additional-timer-button')).toBeInTheDocument(),
    );

    // 추가 작전 시간 버튼 누를 시 추가 작전 시간 타이머가 표시되는지 확인
    await waitFor(async () => {
      // 추가 작전 시간 버튼 클릭
      const additionalTimerbutton = screen.getByTestId(
        'additional-timer-button',
      );
      await userEvent.click(additionalTimerbutton);

      // 작전 시간 타이머의 조작부 존재하는지 확인
      expect(
        screen.getByTestId('additional-timer-controller'),
      ).toBeInTheDocument();
    });
  });

  it('툴팁 렌더링 검증', async () => {
    renderTimerPage();

    // 툴팁 표시되는지 확인
    await waitFor(() =>
      expect(screen.getByTestId('tooltip')).toBeInTheDocument(),
    );

    // 툴팁 닫기 버튼 존재하는지 확인
    await waitFor(() =>
      expect(screen.getByTestId('tooltip-button')).toBeInTheDocument(),
    );

    // 툴팁을 닫을 수 있는지 확인
    await waitFor(async () => {
      // 툴팁 표시되는지 확인
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();

      // 툴팁 닫기 버튼 클릭
      const tooltipButton = screen.getByTestId('tooltip-button');
      await userEvent.click(tooltipButton);

      // 툴팁이 닫혔는지 확인
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
    });
  });
});
