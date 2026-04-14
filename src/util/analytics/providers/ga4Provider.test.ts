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
});
