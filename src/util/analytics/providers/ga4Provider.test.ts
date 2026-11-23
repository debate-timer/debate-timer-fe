import ReactGA from 'react-ga4';
import { GA4Provider } from './ga4Provider';
import type { EnrichedEventProperties, PageViewProperties } from '../types';

vi.mock('react-ga4');

describe('GA4Provider', () => {
  let provider: GA4Provider;
  /** GA4Provider 초기화 테스트에 사용하는 고정 측정 ID다. */
  const TEST_GA_ID = 'G-TEST';

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GA4Provider(TEST_GA_ID);
  });

  test('trackPageView 호출 시 ReactGA.send가 호출된다', () => {
    const props: EnrichedEventProperties<PageViewProperties> = {
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
      user_type: 'guest',
      language: 'ko',
      page_path: '/home',
    };
    provider.trackPageView(props);
    expect(ReactGA.send).toHaveBeenCalledWith({
      hitType: 'pageview',
      page: '/home',
      title: 'Home',
    });
  });

  test('trackEvent 호출 시 ReactGA.event가 호출된다', () => {
    const props = {
      table_id: 1 as number | 'guest',
      total_rounds: 5,
      user_type: 'guest' as const,
      language: 'ko',
      page_path: '/timer',
    };
    provider.trackEvent('timer_started', props);
    expect(ReactGA.event).toHaveBeenCalledWith('timer_started', props);
  });

  it('init, setUserId, reset 호출 시 ReactGA 메서드가 호출된다', () => {
    provider.init();
    provider.setUserId('user-123');
    provider.reset();

    expect(ReactGA.initialize).toHaveBeenCalledWith(TEST_GA_ID);
    expect(ReactGA.set).toHaveBeenNthCalledWith(1, { user_id: 'user-123' });
    expect(ReactGA.set).toHaveBeenNthCalledWith(2, { user_id: null });
  });
});

describe('GA4Provider CJS interop', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('react-ga4');
  });

  it('react-ga4가 중첩 default 객체로 번들되어도 내부 GA4 클라이언트를 해석해 호출한다', async () => {
    const nestedClient = {
      initialize: vi.fn(),
      send: vi.fn(),
      event: vi.fn(),
      set: vi.fn(),
    };

    vi.resetModules();
    vi.doMock('react-ga4', () => ({
      default: { default: nestedClient },
    }));

    const { GA4Provider: DynamicGA4Provider } = await import('./ga4Provider');
    const provider = new DynamicGA4Provider('G-NESTED');

    provider.init();
    provider.trackPageView({
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
      user_type: 'guest',
      language: 'ko',
      page_path: '/',
    });
    provider.trackEvent('timer_started', {
      table_id: 1,
      total_rounds: 3,
      user_type: 'guest',
      language: 'ko',
      page_path: '/table/customize/1',
    });
    provider.setUserId('42');
    provider.reset();

    expect(nestedClient.initialize).toHaveBeenCalledWith('G-NESTED');
    expect(nestedClient.send).toHaveBeenCalledWith({
      hitType: 'pageview',
      page: '/',
      title: 'Home',
    });
    expect(nestedClient.event).toHaveBeenCalledWith(
      'timer_started',
      expect.objectContaining({ table_id: 1 }),
    );
    expect(nestedClient.set).toHaveBeenNthCalledWith(1, { user_id: '42' });
    expect(nestedClient.set).toHaveBeenNthCalledWith(2, { user_id: null });
  });
});
