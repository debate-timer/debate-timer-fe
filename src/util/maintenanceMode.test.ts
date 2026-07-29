import { resolveMaintenanceMode } from './maintenanceMode';

describe('점검 모드 환경 변수 판정', () => {
  test.each([
    [undefined, false],
    ['', false],
    ['false', false],
    ['TRUE', false],
    [' true ', false],
    ['enabled', false],
    ['true', true],
  ])('%s 값을 %s로 판정한다', (value, expected) => {
    expect(resolveMaintenanceMode(value)).toBe(expected);
  });
});
