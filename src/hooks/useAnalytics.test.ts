import { renderHook } from '@testing-library/react';
import useAnalytics from './useAnalytics';
import { analyticsManager } from '../util/analytics';

vi.mock('../util/analytics', () => ({
  analyticsManager: {
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    setUserId: vi.fn(),
    setUserProperties: vi.fn(),
    reset: vi.fn(),
    flush: vi.fn(),
  },
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('trackEvent를 호출할 수 있다', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.trackEvent('template_selected', {
      organization_name: 'org',
      template_name: 'tmpl',
    });
    expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
      'template_selected',
      { organization_name: 'org', template_name: 'tmpl' },
    );
  });

  test('trackPageView를 호출할 수 있다', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.trackPageView({
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
    });
    expect(analyticsManager.trackPageView).toHaveBeenCalledWith({
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
    });
  });

  test('identifyUser를 호출하면 setUserId와 setUserProperties가 호출된다', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.identifyUser(42);
    expect(analyticsManager.setUserId).toHaveBeenCalledWith('42');
    expect(analyticsManager.setUserProperties).toHaveBeenCalledWith({
      user_type: 'member',
    });
  });

  test('resetUser를 호출하면 reset이 호출된다', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.resetUser();
    expect(analyticsManager.reset).toHaveBeenCalled();
  });
});
