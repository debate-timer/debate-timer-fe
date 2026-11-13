import { act, renderHook } from '@testing-library/react';
import { setAccessToken, setMemberId } from '../../../util/accessToken';
import useDebateLogout from './useDebateLogout';

const MUTATE = vi.hoisted(() => vi.fn());
vi.mock('../../../hooks/mutations/useLogout', () => ({
  default: () => ({ mutateAsync: MUTATE }),
}));

describe('토론 중 로그아웃', () => {
  const OPTIONS = {
    stopTimers: vi.fn(),
    discardTranscript: vi.fn(),
    stopSharing: vi.fn(),
    exitFullscreen: vi.fn(async () => {}),
    issueSettings: vi.fn(),
    onSuccess: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    MUTATE.mockResolvedValue(true);
  });
  it('경고 취소는 진행 상태를 정리하거나 로그아웃하지 않는다', async () => {
    const { result } = renderHook(() => useDebateLogout(OPTIONS));
    let request!: Promise<void>;
    act(() => {
      request = result.current.requestLogout();
    });
    act(() => result.current.cancelLogout());
    await request;
    expect(OPTIONS.discardTranscript).not.toHaveBeenCalled();
    expect(MUTATE).not.toHaveBeenCalled();
  });
  it('확인 후 한 번 정리하고 실패해도 진행을 재개하지 않으며 재시도한다', async () => {
    MUTATE.mockRejectedValueOnce(new Error('logout'));
    const { result } = renderHook(() => useDebateLogout(OPTIONS));
    let request!: Promise<void>;
    act(() => {
      request = result.current.requestLogout();
    });
    const rejection = expect(request).rejects.toThrow('logout');
    await act(() => result.current.confirmLogout());
    await rejection;
    expect(result.current.isInterrupted).toBe(true);
    expect(result.current.hasError).toBe(true);
    expect(OPTIONS.discardTranscript).toHaveBeenCalledTimes(1);
    await act(() => result.current.confirmLogout());
    expect(MUTATE).toHaveBeenCalledTimes(2);
    expect(OPTIONS.discardTranscript).toHaveBeenCalledTimes(1);
  });
  it('전체 화면 해제를 기다리는 사이 계정이 바뀌면 새 계정으로 로그아웃하지 않는다', async () => {
    setAccessToken('a');
    setMemberId(1);
    let release!: () => void;
    OPTIONS.exitFullscreen.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const { result } = renderHook(() => useDebateLogout(OPTIONS));
    let request!: Promise<void>;
    act(() => {
      request = result.current.requestLogout();
    });
    const rejection = expect(request).rejects.toThrow('ACCOUNT_CHANGED');
    let confirming!: Promise<void>;
    act(() => {
      confirming = result.current.confirmLogout();
    });
    setMemberId(2);
    await act(async () => {
      release();
      await confirming;
    });
    await rejection;
    expect(MUTATE).not.toHaveBeenCalled();
    expect(OPTIONS.issueSettings).not.toHaveBeenCalled();
    localStorage.clear();
  });
});
