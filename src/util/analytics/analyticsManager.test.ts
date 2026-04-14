import { AnalyticsManager } from './analyticsManager';
import type { AnalyticsProvider } from './types';

/**
 * 매니저 테스트에 사용할 mock provider를 만든다.
 * `name`은 provider 식별용 이름이며, 각 메서드가 mock 처리된 `AnalyticsProvider`를 반환한다.
 */
function createMockProvider(name = 'mock'): AnalyticsProvider {
  return {
    name,
    init: vi.fn(),
    trackPageView: vi.fn(),
    trackEvent: vi.fn(),
    setUserId: vi.fn(),
    setUserProperties: vi.fn(),
    reset: vi.fn(),
    flush: vi.fn(),
  };
}

describe('AnalyticsManager', () => {
  let manager: AnalyticsManager;

  beforeEach(() => {
    manager = new AnalyticsManager();
  });

  test('provider를 등록하고 init 시 provider.init이 호출된다', () => {
    const provider = createMockProvider();
    manager.addProvider(provider);
    manager.init();
    expect(provider.init).toHaveBeenCalled();
  });

  test('여러 provider에 이벤트를 팬아웃한다', () => {
    const p1 = createMockProvider('p1');
    const p2 = createMockProvider('p2');
    manager.addProvider(p1);
    manager.addProvider(p2);

    manager.trackEvent('template_selected', {
      organization_name: 'org',
      template_name: 'tmpl',
    });

    expect(p1.trackEvent).toHaveBeenCalled();
    expect(p2.trackEvent).toHaveBeenCalled();
  });

  test('trackPageView를 모든 provider에 전달한다', () => {
    const p1 = createMockProvider('p1');
    const p2 = createMockProvider('p2');
    manager.addProvider(p1);
    manager.addProvider(p2);

    manager.trackPageView({
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
    });

    expect(p1.trackPageView).toHaveBeenCalled();
    expect(p2.trackPageView).toHaveBeenCalled();
  });

  test('setUserId를 모든 provider에 전파한다', () => {
    const p1 = createMockProvider('p1');
    const p2 = createMockProvider('p2');
    manager.addProvider(p1);
    manager.addProvider(p2);

    manager.setUserId('123');

    expect(p1.setUserId).toHaveBeenCalledWith('123');
    expect(p2.setUserId).toHaveBeenCalledWith('123');
  });

  test('setUserProperties를 모든 provider에 전파한다', () => {
    const p1 = createMockProvider('p1');
    manager.addProvider(p1);

    const props = { user_type: 'member' as const, language: 'ko' };
    manager.setUserProperties(props);

    expect(p1.setUserProperties).toHaveBeenCalledWith(props);
  });

  test('reset을 모든 provider에 전파한다', () => {
    const p1 = createMockProvider('p1');
    manager.addProvider(p1);

    manager.reset();

    expect(p1.reset).toHaveBeenCalled();
  });

  test('flush를 모든 provider에 전파한다', () => {
    const p1 = createMockProvider('p1');
    manager.addProvider(p1);

    manager.flush();

    expect(p1.flush).toHaveBeenCalled();
  });

  test('provider가 없어도 에러 없이 동작한다', () => {
    expect(() => {
      manager.trackEvent('template_selected', {
        organization_name: 'org',
        template_name: 'tmpl',
      });
    }).not.toThrow();
  });

  test('provider에서 에러 발생 시 다른 provider에 영향 없다', () => {
    const errorProvider = createMockProvider('error');
    vi.mocked(errorProvider.trackEvent).mockImplementation(() => {
      throw new Error('Provider error');
    });
    const normalProvider = createMockProvider('normal');

    manager.addProvider(errorProvider);
    manager.addProvider(normalProvider);

    manager.trackEvent('template_selected', {
      organization_name: 'org',
      template_name: 'tmpl',
    });

    expect(normalProvider.trackEvent).toHaveBeenCalled();
  });

  test('trackEvent 시 글로벌 필드가 자동 합성된다', () => {
    const provider = createMockProvider();
    manager.addProvider(provider);

    manager.trackEvent('template_selected', {
      organization_name: 'org',
      template_name: 'tmpl',
    });

    const calledWith = vi.mocked(provider.trackEvent).mock.calls[0];
    const properties = calledWith[1];
    expect(properties).toHaveProperty('user_type');
    expect(properties).toHaveProperty('language');
    expect(properties).toHaveProperty('page_path');
  });

  test('trackPageView 시 글로벌 필드가 자동 합성된다', () => {
    const provider = createMockProvider();
    manager.addProvider(provider);

    manager.trackPageView({
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
    });

    const calledWith = vi.mocked(provider.trackPageView).mock.calls[0][0];
    expect(calledWith).toHaveProperty('user_type');
    expect(calledWith).toHaveProperty('language');
    expect(calledWith).toHaveProperty('page_path');
  });
});
