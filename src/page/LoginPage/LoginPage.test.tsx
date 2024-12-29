import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LoginPage', () => {
  it('LoginPage에서 라우팅이 잘 동작하는지 검증', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    // 헤더 텍스트 확인
    expect(screen.getByText('헤더')).toBeInTheDocument();
    expect(screen.getByText('의회식')).toBeInTheDocument();
    expect(screen.getByText('제목')).toBeInTheDocument();

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
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const button = screen.getByText('로그인');
    await userEvent.click(button);

    expect(navigate).toHaveBeenCalledWith('/table');
  });
});
