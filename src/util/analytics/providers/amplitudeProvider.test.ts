import * as amplitude from '@amplitude/analytics-browser';
import { AmplitudeProvider } from './amplitudeProvider';
import type { EnrichedEventProperties, PageViewProperties } from '../types';

vi.mock('@amplitude/analytics-browser');

describe('AmplitudeProvider', () => {
  let provider: AmplitudeProvider;
  /** AmplitudeProvider 초기화 테스트에 사용하는 고정 API 키다. */
  const TEST_API_KEY = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new AmplitudeProvider(TEST_API_KEY);
  });

  test('init 호출 시 amplitude.init이 API 키로 호출된다', () => {
    provider.init();
    expect(amplitude.init).toHaveBeenCalledWith(TEST_API_KEY);
  });

  test('trackPageView 호출 시 amplitude.track이 page_view로 호출된다', () => {
    const props: EnrichedEventProperties<PageViewProperties> = {
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
      user_type: 'guest',
      language: 'ko',
      page_path: '/home',
    };
    provider.trackPageView(props);
    expect(amplitude.track).toHaveBeenCalledWith('page_view', props);
  });

  test('trackEvent 호출 시 amplitude.track이 호출된다', () => {
    const props = {
      organization_name: 'org',
      template_name: 'tmpl',
      user_type: 'guest' as const,
      language: 'ko',
      page_path: '/home',
    };
    provider.trackEvent('template_selected', props);
    expect(amplitude.track).toHaveBeenCalledWith('template_selected', props);
  });

  test('setUserId 호출 시 amplitude.setUserId가 user_ prefix와 함께 호출된다', () => {
    provider.setUserId('42');
    expect(amplitude.setUserId).toHaveBeenCalledWith('user_42');
  });

  test('setUserProperties 호출 시 amplitude.identify가 호출된다', () => {
    provider.setUserProperties({ user_type: 'member', language: 'ko' });
    expect(amplitude.identify).toHaveBeenCalled();
  });

  test('reset 호출 시 amplitude.reset이 호출된다', () => {
    provider.reset();
    expect(amplitude.reset).toHaveBeenCalled();
  });

  test('flush 호출 시 amplitude.flush이 호출된다', () => {
    provider.flush();
    expect(amplitude.flush).toHaveBeenCalled();
  });
});
