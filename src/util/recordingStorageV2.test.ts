import {
  clearHostRecordingV2,
  getAudienceDeviceTokenV2,
  getHostRecordingV2,
  saveAudienceDeviceTokenV2,
  saveHostRecordingV2,
  updateHostDeviceTokenV2,
} from './recordingStorageV2';

describe('다기기 녹음 세션 보관', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('사회자 녹음 세션을 테이블별로 보관한다', () => {
    const host = {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    };
    saveHostRecordingV2(5, host);

    expect(getHostRecordingV2(5)).toEqual(host);
    expect(getHostRecordingV2(6)).toBeNull();
  });

  it('사회자 기기 토큰만 새 값으로 바꾼다', () => {
    saveHostRecordingV2(5, {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'old',
    });

    updateHostDeviceTokenV2(5, 'session-1', 'new');

    expect(getHostRecordingV2(5)?.deviceToken).toBe('new');
  });

  it('토큰을 받는 사이 세션이 바뀌었으면 지금 세션 기록을 덮지 않는다', () => {
    saveHostRecordingV2(5, {
      sessionKey: 'session-2',
      joinCode: 'join',
      deviceToken: 'current',
    });

    updateHostDeviceTokenV2(5, 'session-1', 'stale');

    expect(getHostRecordingV2(5)?.deviceToken).toBe('current');
  });

  it('지운 세션은 다시 읽지 않는다', () => {
    saveHostRecordingV2(5, {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    });

    clearHostRecordingV2(5);

    expect(getHostRecordingV2(5)).toBeNull();
  });

  it('형식이 깨진 값은 없는 것으로 본다', () => {
    sessionStorage.setItem('RecordingV2Host:5', '{"sessionKey":1}');
    sessionStorage.setItem('RecordingV2Host:6', 'not-json');

    expect(getHostRecordingV2(5)).toBeNull();
    expect(getHostRecordingV2(6)).toBeNull();
  });

  it('청중 기기 토큰을 녹음 세션별로 보관한다', () => {
    saveAudienceDeviceTokenV2('session-1', 'token');

    expect(getAudienceDeviceTokenV2('session-1')).toBe('token');
    expect(getAudienceDeviceTokenV2('session-2')).toBeNull();
  });

  it('저장소에 쓰지 못하면 이번 탭 메모리에서 읽는다', () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
    const host = {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    };

    saveHostRecordingV2(7, host);
    saveAudienceDeviceTokenV2('session-1', 'audience-token');

    expect(getHostRecordingV2(7)).toEqual(host);
    expect(getAudienceDeviceTokenV2('session-1')).toBe('audience-token');

    clearHostRecordingV2(7);
    expect(getHostRecordingV2(7)).toBeNull();
    setItem.mockRestore();
  });
});
