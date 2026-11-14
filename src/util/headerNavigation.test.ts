import { getCompatibilityDestination, getHeaderRole } from './headerNavigation';

describe('헤더 경로와 호환 이동', () => {
  it.each([
    ['/home?source=old#intro', '/?source=old#intro'],
    ['/en/home?source=old#intro', '/en?source=old#intro'],
    ['/?tab=records&sort=recent#item', '/records?sort=recent#item'],
    [
      '/en/dashboard?tab=records&sort=recent#item',
      '/en/records?sort=recent#item',
    ],
    ['/ko/?tab=records', '/records'],
    ['/dashboard?tab=tables', null],
    ['/composition?tab=records', null],
  ])('%s에서 필요한 호환 목적지만 만든다', (source, destination) => {
    expect(getCompatibilityDestination(source)).toBe(destination);
  });
  it.each([
    ['/table/customize/guest', 'timer'],
    ['/en/table/customize/1/end/feedback', 'timer'],
    ['/table/customize/1/end/vote/2', 'timer'],
    ['/table/customize/1/end/vote/2/result', 'general'],
    ['/live/1/end', 'audience'],
    ['/vote/end', 'audience'],
    ['/transcript/shared/token', 'general'],
    ['/dashboard', 'general'],
  ])('%s의 헤더 역할을 구분한다', (path, role) => {
    expect(getHeaderRole(path)).toBe(role);
  });
});
