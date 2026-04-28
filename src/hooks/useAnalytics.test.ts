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

  test('이벤트 정보를 분석 매니저로 그대로 전달한다', () => {
    const { result } = renderHook(() => useAnalytics());

    result.current.trackEvent('template_selected', {
      organization_name: 'org',
      template_name: 'tmpl',
      template_label: 'org - tmpl',
    });

    expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
      'template_selected',
      expect.objectContaining({
        organization_name: 'org',
        template_name: 'tmpl',
      }),
    );
  });

  test('페이지뷰를 기록하면 페이지 정보가 분석 매니저로 전달된다', () => {
    const { result } = renderHook(() => useAnalytics());

    result.current.trackPageView({
      page_title: 'Home',
      previous_page_path: '',
      referrer: '',
    });

    expect(analyticsManager.trackPageView).toHaveBeenCalledWith(
      expect.objectContaining({ page_title: 'Home' }),
    );
  });

  test('멤버를 식별하면 ID는 문자열로 변환되고 사용자 타입은 member로 기록된다', () => {
    const { result } = renderHook(() => useAnalytics());

    result.current.identifyUser(42);

    expect(analyticsManager.setUserId).toHaveBeenCalledWith('42');
    expect(analyticsManager.setUserProperties).toHaveBeenCalledWith(
      expect.objectContaining({ user_type: 'member' }),
    );
  });

  test('사용자 세션을 종료하면 분석 상태가 초기화된다', () => {
    const { result } = renderHook(() => useAnalytics());

    result.current.resetUser();

    expect(analyticsManager.reset).toHaveBeenCalled();
  });
});
