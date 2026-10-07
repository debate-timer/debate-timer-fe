import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { GetOrganizationTemplatesResponseType } from '../../apis/responses/organization';
import { useGetOrganizationTemplates } from './useGetOrganizationTemplates';
import i18n from '../../i18n';

const MOCK_TEMPLATES_RESPONSE: GetOrganizationTemplatesResponseType = {
  organizations: [
    {
      organization: '테스트 기관',
      affiliation: '테스트 대학',
      iconPath: '/icon/test.png',
      templates: [],
    },
  ],
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe('기관 템플릿 조회', () => {
  beforeAll(() => {
    // 이 테스트는 번역 파일 로딩 대신 언어별 API 요청과 캐시를 검증함.
    i18n.addResourceBundle('ko', 'translation', {});
    i18n.addResourceBundle('en', 'translation', {});
  });

  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  afterEach(async () => {
    await i18n.changeLanguage('ko');
  });

  it('한국어(ko) 설정 시 language=KO_KR 파라미터로 요청한다', async () => {
    const queryClient = createQueryClient();
    let capturedLanguage: string | null = null;

    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const url = new URL(request.url);
        capturedLanguage = url.searchParams.get('language');
        return HttpResponse.json(MOCK_TEMPLATES_RESPONSE);
      }),
    );

    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(capturedLanguage).toBe('KO_KR');
    expect(result.current.data).toEqual(MOCK_TEMPLATES_RESPONSE);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'KO_KR']),
    ).toEqual(MOCK_TEMPLATES_RESPONSE);
  });

  it('영어(en) 설정 시 language=US_EN 파라미터로 요청한다', async () => {
    await i18n.changeLanguage('en');
    const queryClient = createQueryClient();
    let capturedLanguage: string | null = null;

    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const url = new URL(request.url);
        capturedLanguage = url.searchParams.get('language');
        return HttpResponse.json(MOCK_TEMPLATES_RESPONSE);
      }),
    );

    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(capturedLanguage).toBe('US_EN');
    expect(result.current.data).toEqual(MOCK_TEMPLATES_RESPONSE);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'US_EN']),
    ).toEqual(MOCK_TEMPLATES_RESPONSE);
  });

  it('enabled=false 이면 API를 호출하지 않는다', () => {
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useGetOrganizationTemplates(false), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});
