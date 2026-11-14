import {
  appendRecordingJoin,
  createTurnKey,
  parseRecordingJoin,
} from './recordingJoinLink';

describe('다기기 녹음 참가 링크', () => {
  it('공유 링크 hash에 녹음 세션과 참가 코드를 붙인다', () => {
    expect(
      appendRecordingJoin('https://debate-timer.com/live/5', {
        sessionKey: 'session/1',
        joinCode: 'Xq2p-L0a_Z8',
      }),
    ).toBe('https://debate-timer.com/live/5#rec=session%2F1&code=Xq2p-L0a_Z8');
  });

  it('hash에서 녹음 세션과 참가 코드를 읽는다', () => {
    expect(parseRecordingJoin('#rec=session%2F1&code=Xq2p-L0a_Z8')).toEqual({
      sessionKey: 'session/1',
      joinCode: 'Xq2p-L0a_Z8',
    });
  });

  it.each(['', '#', '#rec=session-1', '#code=abc', '#rec=&code=abc'])(
    '녹음 세션이나 참가 코드가 없는 hash(%s)는 무시한다',
    (hash) => {
      expect(parseRecordingJoin(hash)).toBeNull();
    },
  );
});

describe('다기기 녹음 턴 키', () => {
  it('타임박스 순서와 구간을 시작한 공유 이벤트 version으로 만든다', () => {
    expect(createTurnKey(3, 1762905600123)).toBe('3-1762905600123');
  });
});
