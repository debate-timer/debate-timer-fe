import {
  consumeLoginReturn,
  saveLoginReturn,
  validateLoginReturn,
} from './loginReturn';

afterEach(() => sessionStorage.clear());

describe('로그인 목적지', () => {
  it.each([
    'https://evil.example',
    '//evil.example/path',
    '/oauth?code=secret',
    '/en/oauth',
    '/unknown',
    '/\\evil.example',
    '/dashboard\n',
  ])('허용하지 않는 목적지 %s를 거절한다', (path) => {
    expect(validateLoginReturn({ path })).toBeNull();
  });
  it('내부 목적지와 해당 라이브의 종료 사유만 한 번 소비한다', () => {
    saveLoginReturn({
      path: '/en/live/12/end?source=link#done',
      termination: { tableId: 12, reason: 'ABORT' },
    });
    expect(consumeLoginReturn()).toEqual({
      path: '/en/live/12/end?source=link#done',
      termination: { tableId: 12, reason: 'ABORT' },
    });
    expect(consumeLoginReturn()).toBeNull();
  });
  it('다른 토론의 사유와 임의 상태를 복제하지 않는다', () => {
    expect(
      validateLoginReturn({
        path: '/live/12/end',
        termination: { tableId: 13, reason: 'ABORT' },
        participantName: '비공개',
      }),
    ).toEqual({ path: '/live/12/end' });
  });
  it('손상된 저장값을 제거한다', () => {
    sessionStorage.setItem('login-return', '{broken');
    expect(consumeLoginReturn()).toBeNull();
    expect(sessionStorage.getItem('login-return')).toBeNull();
  });
  it('저장소 실패로 로그인 흐름을 중단하지 않는다', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    expect(() => saveLoginReturn({ path: '/records' })).not.toThrow();
    spy.mockRestore();
  });
});
