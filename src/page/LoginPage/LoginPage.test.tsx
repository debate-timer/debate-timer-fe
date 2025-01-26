import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
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
    expect(
      screen.getByPlaceholderText('닉네임을 입력해주세요'),
    ).toBeInTheDocument();
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('로그인 버튼 클릭 시 /table 경로로 라우팅 검증', async () => {
    const navigate = vi.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    );

    // 닉네임 입력 필드 찾기
    const nicknameInput = screen.getByPlaceholderText('닉네임을 입력해주세요');

    // 닉네임 입력
    await userEvent.type(nicknameInput, 'User');

    // 로그인 버튼 클릭
    const button = screen.getByText('로그인');
    await userEvent.click(button);

    // useNavigate가 "/table" 경로로 호출되었는지 확인
    expect(navigate).toHaveBeenCalledWith('/');
  });
  it('닉네임이 비어 있으면 경고 메시지를 표시', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    );

    const loginButton = screen.getByText('로그인');
    window.alert = vi.fn(); // alert를 mock으로 설정

    // 로그인 버튼 클릭 (닉네임 비어 있음)
    await userEvent.click(loginButton);

    // alert가 호출되었는지 확인
    expect(window.alert).toHaveBeenCalledWith('닉네임을 입력해주세요.');
  });
  it('닉네임이 비어 있으면 경고 메시지를 표시', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    );

    const loginButton = screen.getByText('로그인');
    window.alert = vi.fn(); // alert를 mock으로 설정

    // 로그인 버튼 클릭 (닉네임 비어 있음)
    await userEvent.click(loginButton);

    // alert가 호출되었는지 확인
    expect(window.alert).toHaveBeenCalledWith('닉네임을 입력해주세요.');
  });
});
