import {
  isAudioRecordingSupported,
  pickRecorderMimeType,
  toAudioFileName,
} from './audioRecorder';

describe('오디오 녹음 브라우저 경계', () => {
  describe('녹음 형식 선택', () => {
    it('Opus WebM을 지원하면 가장 먼저 고른다', () => {
      expect(pickRecorderMimeType(() => true)).toBe('audio/webm;codecs=opus');
    });

    it('WebM을 지원하지 않는 Safari는 MP4를 고른다', () => {
      expect(pickRecorderMimeType((type) => type === 'audio/mp4')).toBe(
        'audio/mp4',
      );
    });

    it('지원하는 형식이 없으면 브라우저 기본 형식에 맡긴다', () => {
      expect(pickRecorderMimeType(() => false)).toBeNull();
    });
  });

  describe('업로드 파일 이름', () => {
    it.each([
      ['audio/webm;codecs=opus', 'segment.webm'],
      ['audio/mp4', 'segment.m4a'],
      ['audio/ogg;codecs=opus', 'segment.ogg'],
      ['', 'segment.webm'],
    ])('%j 형식은 %s로 보낸다', (mimeType, fileName) => {
      expect(toAudioFileName(mimeType)).toBe(fileName);
    });
  });

  describe('녹음 지원 여부', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('MediaRecorder가 없으면 지원하지 않는다', () => {
      vi.stubGlobal('MediaRecorder', undefined);

      expect(isAudioRecordingSupported()).toBe(false);
    });

    it('MediaRecorder와 마이크 접근이 모두 있으면 지원한다', () => {
      vi.stubGlobal('MediaRecorder', class {});
      vi.stubGlobal('navigator', {
        mediaDevices: { getUserMedia: vi.fn() },
      });

      expect(isAudioRecordingSupported()).toBe(true);
    });
  });
});
