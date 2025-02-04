import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 공통 Wrapper 생성
export function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

// react-router-dom의 useNavigate 모의(Mock)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LoginPage', () => {
  it('LoginPage에서 UI 요소가 제대로 렌더링되는지 확인', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    );

    // 제목 텍스트 확인
    expect(screen.getByText('Debate Timer')).toBeInTheDocument();

    // 입력 필드와 버튼 확인
    expect(screen.getByText('구글 계정으로 로그인')).toBeInTheDocument();
  });
});
