import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
              path="/overview/1"
              element={<h1 data-testid="overview-page">Overview Page</h1>}
            />
          </Routes>
        </MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}

describe('TableComposition', () => {
  beforeEach(() => {
    // 세션스토리지 초기화 등 필요한 작업
    sessionStorage.clear();
  });

  it('기본 레이아웃과 "이름타입입력" 첫 단계가 렌더링된다 (mode=add)', async () => {
    render(
      <TestWrapper initialEntries={['/composition?mode=add']}>
        <TableComposition />
      </TestWrapper>,
    );

    expect(
      screen.findByRole('heading', {
        name: '어떤 토론을 원하시나요?',
      }),
    );
    expect(screen.getByText('토론 유형')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '타임박스 만들기' }),
    ).toBeInTheDocument();
  });

  it('mode=edit일 때 서버에서 가져온 초기값이 반영된다 (tableId=1)', async () => {
    render(
      <TestWrapper initialEntries={['/composition?mode=edit&tableId=1']}>
        <TableComposition />
      </TestWrapper>,
    );

    expect(
      screen.findByRole('heading', {
        name: '어떤 토론을 원하시나요?',
      }),
    );
    const nameInput = await screen.findByPlaceholderText('시간표#1(디폴트 값)');

    expect((nameInput as HTMLInputElement).value).toBe('테이블 1');
  });

  it('다음 버튼 클릭 시 "타임박스입력" 단계로 이동한다', async () => {
    render(
      <TestWrapper initialEntries={['/composition?mode=add']}>
        <TableComposition />
      </TestWrapper>,
    );

    const nextButton = screen.getByText('타임박스 만들기');
    await userEvent.click(nextButton);

    // TimeBoxStep 컴포넌트가 표시된다고 가정
    // 예: TimeBoxStep에 data-testid="time-box-step"가 있다면:
    expect(screen.getByText('토론 주제')).toBeInTheDocument();
  });

  it('타임박스 단계에서 "완료" 버튼 클릭 시, overview 페이지로 이동한다 (mode=add)', async () => {
    // 1. 초기 단계
    render(
      <TestWrapper initialEntries={['/composition?mode=add']}>
        <TableComposition />
      </TestWrapper>,
    );

    const nextButton = screen.getByText('타임박스 만들기');
    await userEvent.click(nextButton);

    // 3. TimeBoxStep 노출 확인
    expect(screen.getByText('토론 주제')).toBeInTheDocument();

    // 4. "완료" (혹은 "제출") 버튼 클릭
    // 실제 버튼 텍스트 확인
    const submitButton = screen.getByText('테이블 추가하기');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('overview-page')).toBeInTheDocument();
    });
  });
});
