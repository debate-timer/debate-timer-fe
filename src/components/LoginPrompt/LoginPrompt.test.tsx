import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPrompt from './LoginPrompt';
import useLoginPrompt from '../../hooks/useLoginPrompt';
import { consumeLoginReturn } from '../../util/loginReturn';
import { oAuthLogin } from '../../util/googleAuth';
import { GlobalPortal } from '../../util/GlobalPortal';

vi.mock('../../util/googleAuth', () => ({ oAuthLogin: vi.fn() }));

function LoginHarness() {
  const login = useLoginPrompt();
  return (
    <>
      <button
        aria-label="기록 열기"
        onClick={() => login.requestLogin('/records')}
      >
        기록
      </button>
      <LoginPrompt login={login} />
    </>
  );
}

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe('로그인 확인', () => {
  it('확인 전 OAuth를 시작하지 않고 취소하면 목적지를 남기지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <GlobalPortal.Provider>
        <MemoryRouter>
          <LoginHarness />
        </MemoryRouter>
      </GlobalPortal.Provider>,
    );
    const trigger = screen.getByRole('button', { name: '기록 열기' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(oAuthLogin).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(consumeLoginReturn()).toBeNull();
    expect(trigger).toHaveFocus();
  });
  it('로그인 확인 시 목적지와 게스트 시간표 유지 선택을 저장한다', async () => {
    sessionStorage.setItem('DebateTableData', '{}');
    const user = userEvent.setup();
    render(
      <GlobalPortal.Provider>
        <MemoryRouter>
          <LoginHarness />
        </MemoryRouter>
      </GlobalPortal.Provider>,
    );
    await user.click(screen.getByRole('button', { name: '기록 열기' }));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(oAuthLogin).toHaveBeenCalledTimes(1);
    expect(consumeLoginReturn()).toEqual({ path: '/records' });
    expect(sessionStorage.getItem('keepGuestTable')).toBe('false');
  });
});
