import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { getMemberSettings, patchMemberSettings } from '../../apis/apis/member';
import { GetMemberSettingsResponseType } from '../../apis/responses/member';
import useGetMemberSettings from './useGetMemberSettings';
import usePatchMemberSettings from '../mutations/usePatchMemberSettings';

vi.mock('../../apis/apis/member', () => ({
  getMemberSettings: vi.fn(),
  patchMemberSettings: vi.fn(),
}));

const SETTINGS_A: GetMemberSettingsResponseType = {
  language: 'ko',
  volume: 0.3,
};
const SETTINGS_B: GetMemberSettingsResponseType = {
  language: 'en',
  volume: 0.8,
};

function createWrapper(client: QueryClient) {
  return function Wrapper(props: PropsWithChildren) {
    const { children } = props;
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function setAccount(memberId: string) {
  localStorage.setItem('memberId', memberId);
  localStorage.setItem('accessToken', `token-${memberId}`);
}

describe('회원 설정 서버 상태', () => {
  let client: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    setAccount('1');
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, throwOnError: true, gcTime: Infinity },
        mutations: { retry: false, throwOnError: true },
      },
    });
    vi.mocked(getMemberSettings).mockResolvedValue(SETTINGS_A);
    vi.mocked(patchMemberSettings).mockResolvedValue(SETTINGS_B);
  });

  afterEach(() => {
    cleanup();
    client.clear();
    localStorage.removeItem('memberId');
    localStorage.removeItem('accessToken');
    focusManager.setFocused(undefined);
    onlineManager.setOnline(true);
  });

  it('비회원은 자동 조회하지 않고 수동 조회·수정도 HTTP 호출 전에 거절한다', async () => {
    localStorage.removeItem('memberId');
    localStorage.removeItem('accessToken');
    const query = renderHook(() => useGetMemberSettings(null), {
      wrapper: createWrapper(client),
    });
    const mutation = renderHook(() => usePatchMemberSettings(null), {
      wrapper: createWrapper(client),
    });
    expect(getMemberSettings).not.toHaveBeenCalled();
    await act(async () => {
      await query.result.current.refetch();
    });
    await act(async () => {
      await expect(
        mutation.result.current.mutateAsync({ volume: 0.8 }),
      ).rejects.toBeInstanceOf(Error);
    });
    expect(getMemberSettings).not.toHaveBeenCalled();
    expect(patchMemberSettings).not.toHaveBeenCalled();
  });

  it('최초 조회 후 포커스·재연결·재마운트는 재조회하지 않고 수동 재시도는 허용한다', async () => {
    const options = { wrapper: createWrapper(client) };
    const first = renderHook(() => useGetMemberSettings('1'), options);
    await waitFor(() => expect(first.result.current.data).toEqual(SETTINGS_A));
    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      onlineManager.setOnline(false);
      onlineManager.setOnline(true);
    });
    first.unmount();
    const second = renderHook(() => useGetMemberSettings('1'), options);
    expect(second.result.current.data).toEqual(SETTINGS_A);
    expect(getMemberSettings).toHaveBeenCalledTimes(1);
    await act(async () => {
      await second.result.current.refetch();
    });
    expect(getMemberSettings).toHaveBeenCalledTimes(2);
  });

  it('조회 실패를 지역 오류로 반환하고 수동 재시도로 복구한다', async () => {
    const error = new Error('조회 실패');
    vi.mocked(getMemberSettings).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useGetMemberSettings('1'), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.data).toBeUndefined();
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.data).toEqual(SETTINGS_A));
  });

  it('계정 전환 뒤 도착한 조회 응답은 새 계정 값을 덮어쓰지 않는다', async () => {
    let resolveA!: (value: GetMemberSettingsResponseType) => void;
    vi.mocked(getMemberSettings).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveA = resolve;
      }),
    );
    const { result, rerender } = renderHook(
      ({ memberId }) => useGetMemberSettings(memberId),
      {
        initialProps: { memberId: '1' },
        wrapper: createWrapper(client),
      },
    );
    await waitFor(() => expect(getMemberSettings).toHaveBeenCalledTimes(1));
    setAccount('2');
    vi.mocked(getMemberSettings).mockResolvedValueOnce(SETTINGS_B);
    rerender({ memberId: '2' });
    await waitFor(() => expect(result.current.data).toEqual(SETTINGS_B));
    await act(async () => {
      resolveA(SETTINGS_A);
    });
    expect(result.current.data).toEqual(SETTINGS_B);
    expect(client.getQueryData(['MemberSettings', '2'])).toEqual(SETTINGS_B);
  });

  it('부분 수정 성공 시 서버의 전체 최종 응답으로 해당 계정 캐시를 갱신한다', async () => {
    client.setQueryData(['MemberSettings', '1'], SETTINGS_A);
    const { result } = renderHook(() => usePatchMemberSettings('1'), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync({ volume: 0.76 });
    });
    expect(patchMemberSettings).toHaveBeenCalledWith({ volume: 0.76 });
    expect(client.getQueryData(['MemberSettings', '1'])).toEqual(SETTINGS_B);
  });

  it('동일 계정의 토큰이 재발급돼도 저장 결과를 캐시에 반영한다', async () => {
    vi.mocked(patchMemberSettings).mockImplementationOnce(async () => {
      localStorage.setItem('accessToken', 'refreshed-token-1');
      return SETTINGS_B;
    });
    const { result } = renderHook(() => usePatchMemberSettings('1'), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync({ volume: 0.8 });
    });
    expect(client.getQueryData(['MemberSettings', '1'])).toEqual(SETTINGS_B);
  });

  it('저장 전에 시작한 조회가 늦게 끝나도 서버의 최종 저장값을 되돌리지 않는다', async () => {
    let resolveQuery!: (value: GetMemberSettingsResponseType) => void;
    vi.mocked(getMemberSettings).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveQuery = resolve;
      }),
    );
    const wrapper = createWrapper(client);
    renderHook(() => useGetMemberSettings('1'), { wrapper });
    await waitFor(() => expect(getMemberSettings).toHaveBeenCalledTimes(1));
    const mutation = renderHook(() => usePatchMemberSettings('1'), { wrapper });
    await act(async () => {
      await mutation.result.current.mutateAsync({ volume: 0.8 });
    });
    await act(async () => {
      resolveQuery(SETTINGS_A);
    });
    expect(client.getQueryData(['MemberSettings', '1'])).toEqual(SETTINGS_B);
  });

  it('수정 실패는 지역 오류로 반환하고 기존 캐시를 유지한다', async () => {
    const error = new Error('저장 실패');
    vi.mocked(patchMemberSettings).mockRejectedValueOnce(error);
    client.setQueryData(['MemberSettings', '1'], SETTINGS_A);
    const { result } = renderHook(() => usePatchMemberSettings('1'), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await expect(result.current.mutateAsync({ volume: 0.8 })).rejects.toBe(
        error,
      );
    });
    await waitFor(() => expect(result.current.error).toBe(error));
    expect(client.getQueryData(['MemberSettings', '1'])).toEqual(SETTINGS_A);
  });

  it('이전 계정 훅으로 새 계정 인증을 사용한 수정을 보내지 않는다', async () => {
    const { result } = renderHook(() => usePatchMemberSettings('1'), {
      wrapper: createWrapper(client),
    });
    setAccount('2');
    await act(async () => {
      await expect(
        result.current.mutateAsync({ volume: 0.8 }),
      ).rejects.toBeInstanceOf(Error);
    });
    expect(patchMemberSettings).not.toHaveBeenCalled();
  });

  it('계정 전환 뒤 늦은 저장 응답이 새 계정 캐시나 제거한 이전 캐시를 만들지 않는다', async () => {
    let resolveA!: (value: GetMemberSettingsResponseType) => void;
    vi.mocked(patchMemberSettings).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveA = resolve;
      }),
    );
    const { result, rerender } = renderHook(
      ({ memberId }) => usePatchMemberSettings(memberId),
      {
        initialProps: { memberId: '1' },
        wrapper: createWrapper(client),
      },
    );
    act(() => {
      result.current.mutate({ volume: 0.9 });
    });
    await waitFor(() => expect(patchMemberSettings).toHaveBeenCalledTimes(1));
    setAccount('2');
    rerender({ memberId: '2' });
    client.removeQueries({ queryKey: ['MemberSettings', '1'] });
    client.setQueryData(['MemberSettings', '2'], SETTINGS_B);
    await act(async () => {
      resolveA({ language: 'ko', volume: 0.9 });
    });
    expect(client.getQueryData(['MemberSettings', '2'])).toEqual(SETTINGS_B);
    expect(client.getQueryData(['MemberSettings', '1'])).toBeUndefined();
  });
});
