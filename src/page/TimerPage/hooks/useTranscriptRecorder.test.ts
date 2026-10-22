import { act, renderHook } from '@testing-library/react';
import useDebateTranscriber from './useDebateTranscriber';
import useSonioxTranscriber from './useSonioxTranscriber';
import useTranscriptRecorder from './useTranscriptRecorder';

vi.mock('./useDebateTranscriber', () => ({ default: vi.fn() }));
vi.mock('./useSonioxTranscriber', () => ({ default: vi.fn() }));

const rpc = {
  isSupported: true,
  isEnabled: false,
  isListening: false,
  interimText: '실시간 문장',
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
    rpc.enable.mockClear();
    soniox.enable.mockClear();
  });

  it('처음에는 RPC 모드이고 모드를 바꿀 수 있다', () => {
    const { result } = renderHook(() => useTranscriptRecorder(params));

    expect(result.current.sttMode).toBe('RPC');
    expect(result.current.isModeLocked).toBe(false);
    expect(result.current.supportedModes).toEqual({ RPC: true, SONIOX: true });
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
      interimText: '',
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
      interimText: '실시간 문장',
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
});
