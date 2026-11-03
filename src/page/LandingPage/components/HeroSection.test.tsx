import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroSection from './HeroSection';
import { isLoggedIn } from '../../../util/accessToken';

vi.mock('../../../util/accessToken', () => ({ isLoggedIn: vi.fn() }));

describe('히어로 섹션', () => {
  const renderHero = () => {
    const handlers = {
      onStartWithoutLogin: vi.fn(),
      onLoginStart: vi.fn(),
      onDashboardButtonClicked: vi.fn(),
    };
    render(<HeroSection {...handlers} />);
    return handlers;
  };

  it('비로그인 상태에서 비회원 시작과 로그인 버튼을 보여 준다', async () => {
    vi.mocked(isLoggedIn).mockReturnValue(false);
    const user = userEvent.setup();
    const handlers = renderHero();

    await user.click(
      screen.getByRole('button', { name: '비회원으로 시작하기' }),
    );
    await user.click(screen.getByRole('button', { name: '3초 로그인' }));

    expect(handlers.onStartWithoutLogin).toHaveBeenCalledTimes(1);
    expect(handlers.onLoginStart).toHaveBeenCalledTimes(1);
  });

  it('서비스 이름을 강조해 보여 준다', () => {
    vi.mocked(isLoggedIn).mockReturnValue(false);
    renderHero();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(
      '토론의 시작부터 끝까지, 디베이트 타이머 하나로',
    );
    expect(heading.querySelector('mark')).toHaveTextContent('디베이트 타이머');
  });

  it('로그인 상태에서는 대시보드 이동 버튼만 보여 준다', async () => {
    vi.mocked(isLoggedIn).mockReturnValue(true);
    const user = userEvent.setup();
    const handlers = renderHero();

    await user.click(screen.getByRole('button', { name: '대시보드로 이동' }));

    expect(handlers.onDashboardButtonClicked).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: '3초 로그인' }),
    ).not.toBeInTheDocument();
  });
});
