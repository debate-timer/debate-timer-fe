import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { GetOrganizationTemplatesResponseType } from '../../apis/responses/organization';
import { useGetOrganizationTemplates } from './useGetOrganizationTemplates';
import i18n from '../../i18n';

const mockTemplatesResponse: GetOrganizationTemplatesResponseType = {
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

describe('useGetOrganizationTemplates', () => {
  afterEach(() => {
    i18n.changeLanguage('ko');
  });

  test('한국어(ko) 설정 시 language=KO_KR 파라미터로 요청한다', async () => {
    i18n.changeLanguage('ko');
    const queryClient = createQueryClient();
    let capturedLanguage: string | null = null;

    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const url = new URL(request.url);
        capturedLanguage = url.searchParams.get('language');
        return HttpResponse.json(mockTemplatesResponse);
      }),
    );

    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(capturedLanguage).toBe('KO_KR');
    expect(result.current.data).toEqual(mockTemplatesResponse);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'KO_KR']),
    ).toEqual(mockTemplatesResponse);
  });

  test('영어(en) 설정 시 language=US_EN 파라미터로 요청한다', async () => {
    await i18n.changeLanguage('en');
    const queryClient = createQueryClient();
    let capturedLanguage: string | null = null;

    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const url = new URL(request.url);
        capturedLanguage = url.searchParams.get('language');
        return HttpResponse.json(mockTemplatesResponse);
      }),
    );

    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(capturedLanguage).toBe('US_EN');
    expect(result.current.data).toEqual(mockTemplatesResponse);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'US_EN']),
    ).toEqual(mockTemplatesResponse);
  });

  test('enabled=false 이면 API를 호출하지 않는다', () => {
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useGetOrganizationTemplates(false), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});
