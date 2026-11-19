import { act, renderHook } from '@testing-library/react';
import useDebateTranscriber from './useDebateTranscriber';
import useSonioxTranscriber from './useSonioxTranscriber';
import useMultiDeviceTranscriber from './useMultiDeviceTranscriber';
import useTranscriptRecorder from './useTranscriptRecorder';

vi.mock('./useDebateTranscriber', () => ({ default: vi.fn() }));
vi.mock('./useSonioxTranscriber', () => ({ default: vi.fn() }));
vi.mock('./useMultiDeviceTranscriber', () => ({ default: vi.fn() }));

const rpc = {
  isSupported: true,
  isEnabled: false,
  isListening: false,
  utteranceCount: 1,
  error: null,
  enable: vi.fn(),
  disable: vi.fn(),
};
const soniox = {
  isSupported: true,
  isEnabled: false,
  isListening: false,
  utteranceCount: 4,
  pendingCount: 2,
  failedCount: 1,
  error: null,
  enable: vi.fn(async () => {}),
  disable: vi.fn(),
};

const SESSION = { sessionKey: 'session-1', joinCode: 'join-1' };
const multiDevice = {
  isSupported: true,
  isEnabled: false,
  isStarting: false,
  isListening: false,
  pendingCount: 0,
  failedCount: 0,
  error: null,
  session: null,
  enable: vi.fn(async () => {}),
  disable: vi.fn(() => SESSION),
  discard: vi.fn(() => null),
};

const params = {
  tableId: 7,
  timeBoxIndex: 0,
  team: null,
  isRunning: true,
  lang: 'ko-KR',
};

describe('STT 모드 선택 기록 훅', () => {
  beforeEach(() => {
    vi.mocked(useDebateTranscriber).mockReturnValue({ ...rpc });
    vi.mocked(useSonioxTranscriber).mockReturnValue({ ...soniox });
    vi.mocked(useMultiDeviceTranscriber).mockReturnValue({
      ...multiDevice,
    } as unknown as ReturnType<typeof useMultiDeviceTranscriber>);
    rpc.enable.mockClear();
    soniox.enable.mockClear();
    multiDevice.enable.mockClear();
    multiDevice.disable.mockClear();
    multiDevice.discard.mockClear();
  });

  it('처음에는 RPC 모드이고 모드를 바꿀 수 있다', () => {
    const { result } = renderHook(() => useTranscriptRecorder(params));

    expect(result.current.sttMode).toBe('RPC');
    expect(result.current.isModeLocked).toBe(false);
    expect(result.current.supportedModes).toEqual({
      RPC: true,
      SONIOX: true,
      MULTI_DEVICE: false,
    });
  });

  it('크롬 음성 인식을 지원하지 않으면 Soniox 모드로 시작한다', () => {
    vi.mocked(useDebateTranscriber).mockReturnValue({
      ...rpc,
      isSupported: false,
    });

    const { result } = renderHook(() => useTranscriptRecorder(params));

    expect(result.current.sttMode).toBe('SONIOX');
  });

  it('Soniox 모드로 켜면 Soniox 녹음만 켜고 그 상태를 보여준다', async () => {
    const { result, rerender } = renderHook(() =>
      useTranscriptRecorder(params),
    );

    await act(() => result.current.enable('SONIOX'));
    vi.mocked(useSonioxTranscriber).mockReturnValue({
      ...soniox,
      isEnabled: true,
    });
    rerender();

    expect(soniox.enable).toHaveBeenCalledTimes(1);
    expect(rpc.enable).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      sttMode: 'SONIOX',
      isModeLocked: true,
      isEnabled: true,
      utteranceCount: 4,
      pendingCount: 2,
      failedCount: 1,
    });
  });

  it('RPC 모드로 켜면 실시간 인식 상태를 보여주고 전사 대기는 없다', async () => {
    const { result, rerender } = renderHook(() =>
      useTranscriptRecorder(params),
    );

    await act(() => result.current.enable('RPC'));
    vi.mocked(useDebateTranscriber).mockReturnValue({
      ...rpc,
      isEnabled: true,
    });
    rerender();

    expect(rpc.enable).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({
      sttMode: 'RPC',
      isModeLocked: true,
      utteranceCount: 1,
      pendingCount: 0,
      failedCount: 0,
    });
  });

  it('모드가 잠긴 뒤에는 다른 모드를 요청해도 시작한 모드로 켠다', async () => {
    const { result, rerender } = renderHook(() =>
      useTranscriptRecorder(params),
    );
    await act(() => result.current.enable('SONIOX'));
    vi.mocked(useSonioxTranscriber).mockReturnValue({
      ...soniox,
      isEnabled: true,
    });
    rerender();

    await act(() => result.current.enable('RPC'));

    expect(rpc.enable).not.toHaveBeenCalled();
    expect(soniox.enable).toHaveBeenCalledTimes(2);
  });

  describe('다기기 녹음', () => {
    it('다기기 녹음 플래그가 있을 때만 고를 수 있다', () => {
      const { result } = renderHook(() =>
        useTranscriptRecorder({ ...params, isMultiDeviceAllowed: true }),
      );

      expect(result.current.supportedModes.MULTI_DEVICE).toBe(true);
    });

    it('다기기 녹음으로 켜면 인식 언어로 세션을 열고 그 상태와 세션을 보여준다', async () => {
      const { result, rerender } = renderHook(() =>
        useTranscriptRecorder({ ...params, isMultiDeviceAllowed: true }),
      );

      await act(() => result.current.enable('MULTI_DEVICE'));
      vi.mocked(useMultiDeviceTranscriber).mockReturnValue({
        ...multiDevice,
        isEnabled: true,
        isListening: true,
        pendingCount: 3,
        session: SESSION,
      } as unknown as ReturnType<typeof useMultiDeviceTranscriber>);
      rerender();

      expect(multiDevice.enable).toHaveBeenCalledWith('ko-KR');
      expect(soniox.enable).not.toHaveBeenCalled();
      expect(result.current.sttMode).toBe('MULTI_DEVICE');
      expect(result.current.isListening).toBe(true);
      expect(result.current.utteranceCount).toBe(0);
      expect(result.current.pendingCount).toBe(3);
      expect(result.current.multiDeviceSession).toEqual(SESSION);
    });

    it('다기기 녹음을 끄면 끝낸 세션의 참가 정보를 돌려준다', async () => {
      const { result } = renderHook(() =>
        useTranscriptRecorder({ ...params, isMultiDeviceAllowed: true }),
      );
      await act(() => result.current.enable('MULTI_DEVICE'));

      let closed: unknown;
      act(() => {
        closed = result.current.disable();
      });

      expect(multiDevice.disable).toHaveBeenCalled();
      expect(closed).toEqual(SESSION);
    });

    it('다른 방식으로 켜면 이 탭에 남은 다기기 녹음 세션을 지운다', async () => {
      const { result } = renderHook(() => useTranscriptRecorder(params));

      await act(() => result.current.enable('SONIOX'));

      expect(multiDevice.discard).toHaveBeenCalled();
      expect(soniox.enable).toHaveBeenCalled();
    });
  });
});
