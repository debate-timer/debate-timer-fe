import { act, renderHook } from '@testing-library/react';
import { getTranscriptDraft } from '../../../util/transcriptDraft';
import type {
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
} from '../../../util/speechRecognition';
import useDebateTranscriber, {
  UseDebateTranscriberParams,
} from './useDebateTranscriber';

class FakeRecognition implements SpeechRecognitionLike {
  static instances: FakeRecognition[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  isStarted = false;
  start = vi.fn(() => {
    this.isStarted = true;
  });
  stop = vi.fn(() => {
    this.isStarted = false;
  });
  abort = vi.fn(() => {
    this.isStarted = false;
  });

  constructor() {
    FakeRecognition.instances.push(this);
  }

  emit(results: { text: string; isFinal: boolean }[], resultIndex = 0) {
    this.onresult?.({
      resultIndex,
      results: results.map(({ text, isFinal }) => ({
        isFinal,
        0: { transcript: text },
      })),
    });
  }

  end() {
    this.onend?.();
  }
}

const latest = () =>
  FakeRecognition.instances[FakeRecognition.instances.length - 1];

const baseParams: UseDebateTranscriberParams = {
  tableId: 7,
  timeBoxIndex: 0,
  team: null,
  isRunning: false,
  lang: 'ko-KR',
};

describe('useDebateTranscriber', () => {
  beforeEach(() => {
    sessionStorage.clear();
    FakeRecognition.instances = [];
    vi.stubGlobal('webkitSpeechRecognition', FakeRecognition);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('기록을 켜도 타이머가 멈춰 있으면 인식을 시작하지 않는다', () => {
    const { result } = renderHook(() => useDebateTranscriber(baseParams));

    act(() => result.current.enable());

    expect(result.current.isEnabled).toBe(true);
    expect(FakeRecognition.instances).toHaveLength(0);
    expect(getTranscriptDraft(7)).toEqual(
      expect.objectContaining({ segments: [] }),
    );
  });

  it('기록 중 타이머가 실행되면 인식하고 확정 문장을 현재 타임박스 구간에 저장한다', () => {
    const { result, rerender } = renderHook(
      (params) => useDebateTranscriber(params),
      { initialProps: baseParams },
    );
    act(() => result.current.enable());

    rerender({ ...baseParams, isRunning: true });
    expect(latest().start).toHaveBeenCalled();
    expect(latest().lang).toBe('ko-KR');

    act(() => latest().emit([{ text: '찬성 입론', isFinal: false }]));
    expect(result.current.interimText).toBe('찬성 입론');

    act(() => latest().emit([{ text: '찬성 입론입니다', isFinal: true }]));

    const segments = getTranscriptDraft(7)!.segments;
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual(
      expect.objectContaining({ timeBoxIndex: 0, team: null }),
    );
    expect(segments[0].utterances[0].text).toBe('찬성 입론입니다');
    expect(result.current.interimText).toBe('');
    expect(result.current.utteranceCount).toBe(1);
  });

  it('타이머가 멈추면 인식을 멈추고, 멈춘 뒤 도착한 확정 문장도 같은 구간에 저장한다', () => {
    const { result, rerender } = renderHook(
      (params) => useDebateTranscriber(params),
      { initialProps: baseParams },
    );
    act(() => result.current.enable());
    rerender({ ...baseParams, isRunning: true });
    const recognition = latest();

    rerender({ ...baseParams, isRunning: false });
    expect(recognition.stop).toHaveBeenCalled();

    act(() => recognition.emit([{ text: '마지막 문장', isFinal: true }]));
    act(() => recognition.end());

    expect(getTranscriptDraft(7)!.segments[0].utterances[0].text).toBe(
      '마지막 문장',
    );
    expect(FakeRecognition.instances).toHaveLength(1);
  });

  it('자유토론에서 발언 팀이 바뀌면 이전 인식이 끝난 뒤 새 구간으로 다시 시작한다', () => {
    const timeBased: UseDebateTranscriberParams = {
      ...baseParams,
      timeBoxIndex: 2,
      team: 'PROS',
    };
    const { result, rerender } = renderHook(
      (params) => useDebateTranscriber(params),
      { initialProps: timeBased },
    );
    act(() => result.current.enable());
    rerender({ ...timeBased, isRunning: true });
    const prosRecognition = latest();
    act(() => prosRecognition.emit([{ text: '찬성 발언', isFinal: true }]));

    rerender({ ...timeBased, isRunning: true, team: 'CONS' });
    expect(prosRecognition.stop).toHaveBeenCalled();
    expect(FakeRecognition.instances).toHaveLength(1);

    act(() => prosRecognition.end());
    act(() => latest().emit([{ text: '반대 발언', isFinal: true }]));

    const segments = getTranscriptDraft(7)!.segments;
    expect(segments.map(({ team }) => team)).toEqual(['PROS', 'CONS']);
    expect(segments[1].utterances[0].text).toBe('반대 발언');
  });

  it('실행 중 인식이 예기치 않게 끝나면 같은 구간으로 다시 시작한다', () => {
    const { result, rerender } = renderHook(
      (params) => useDebateTranscriber(params),
      { initialProps: baseParams },
    );
    act(() => result.current.enable());
    rerender({ ...baseParams, isRunning: true });
    act(() => latest().emit([{ text: '첫 문장', isFinal: true }]));

    act(() => latest().end());
    act(() => latest().emit([{ text: '이어진 문장', isFinal: true }]));

    expect(FakeRecognition.instances).toHaveLength(2);
    const segments = getTranscriptDraft(7)!.segments;
    expect(segments).toHaveLength(1);
    expect(segments[0].utterances.map(({ text }) => text)).toEqual([
      '첫 문장',
      '이어진 문장',
    ]);
  });

  it('마이크 권한이 거부되면 기록을 끄고 오류를 알린다', () => {
    const { result, rerender } = renderHook(
      (params) => useDebateTranscriber(params),
      { initialProps: baseParams },
    );
    act(() => result.current.enable());
    rerender({ ...baseParams, isRunning: true });

    act(() => latest().onerror?.({ error: 'not-allowed' }));
    act(() => latest().end());

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.error).toBe('not-allowed');
    expect(FakeRecognition.instances).toHaveLength(1);
  });

  it('브라우저가 음성 인식을 지원하지 않으면 지원하지 않음으로 알린다', () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('webkitSpeechRecognition', undefined);
    vi.stubGlobal('SpeechRecognition', undefined);

    const { result } = renderHook(() => useDebateTranscriber(baseParams));

    expect(result.current.isSupported).toBe(false);
  });
});
