import { isMaintenanceAccessAllowed } from './maintenanceAccess';

describe('점검 중 라우트 접근 정책', () => {
  test('홈은 게스트 세션 없이도 허용한다', () => {
    expect(
      isMaintenanceAccessAllowed({
        access: 'home',
        hasGuestSession: false,
        params: {},
        search: '',
      }),
    ).toBe(true);
  });

  test.each([
    ['guest-composition', { mode: 'edit', type: 'CUSTOMIZE' }],
    ['guest-overview', { type: 'customize', id: 'guest' }],
    ['guest-timer', { id: 'guest' }],
  ] as const)('%s 경로는 게스트 세션이 있어야 허용한다', (access, params) => {
    const search =
      access === 'guest-composition' ? '?mode=edit&type=CUSTOMIZE' : '';

    expect(
      isMaintenanceAccessAllowed({
        access,
        hasGuestSession: true,
        params,
        search,
      }),
    ).toBe(true);
    expect(
      isMaintenanceAccessAllowed({
        access,
        hasGuestSession: false,
        params,
        search,
      }),
    ).toBe(false);
  });

  test.each([
    ['?mode=add&type=CUSTOMIZE'],
    ['?mode=edit&type=CUSTOMIZE&tableId=1'],
    ['?mode=edit'],
  ])('허용 계약과 다른 composition 쿼리를 차단한다: %s', (search) => {
    expect(
      isMaintenanceAccessAllowed({
        access: 'guest-composition',
        hasGuestSession: true,
        params: {},
        search,
      }),
    ).toBe(false);
  });

  test('숫자 ID를 사용하는 개요와 타이머를 차단한다', () => {
    expect(
      isMaintenanceAccessAllowed({
        access: 'guest-overview',
        hasGuestSession: true,
        params: { type: 'customize', id: '10' },
        search: '',
      }),
    ).toBe(false);
    expect(
      isMaintenanceAccessAllowed({
        access: 'guest-timer',
        hasGuestSession: true,
        params: { id: '10' },
        search: '',
      }),
    ).toBe(false);
  });

  test('허용 목록에 없는 경로를 차단한다', () => {
    expect(
      isMaintenanceAccessAllowed({
        access: 'blocked',
        hasGuestSession: true,
        params: {},
        search: '',
      }),
    ).toBe(false);
  });
});
