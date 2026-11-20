import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { GetOrganizationTemplatesResponseType } from '../../apis/responses/organization';
import useGetOrganizationTemplates from './useGetOrganizationTemplates';
import i18n from '../../i18n';

const MOCK_TEMPLATES_RESPONSE: GetOrganizationTemplatesResponseType = {
  organizations: [
    {
      organization: '테스트 기관',
      category: 'DEBATE_CLUB',
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
    // 빈 리소스는 resolvedLanguage를 국문 fallback으로 남길 수 있어 두 언어에 실제 키를 등록함.
    i18n.addResourceBundle('ko', 'translation', { marker: '국문' });
    i18n.addResourceBundle('en', 'translation', { marker: 'English' });
  });

  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  afterEach(async () => {
    await i18n.changeLanguage('ko');
  });

  it('한국어에서는 국문만 조회하고 언어별 캐시에 보관한다', async () => {
    const queryClient = createQueryClient();
    const languages: (string | null)[] = [];
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        languages.push(new URL(request.url).searchParams.get('language'));
        return HttpResponse.json(MOCK_TEMPLATES_RESPONSE);
      }),
    );
    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(languages.sort()).toEqual(['KO_KR']);
    expect(result.current.data).toEqual(MOCK_TEMPLATES_RESPONSE);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'KO_KR']),
    ).toEqual(MOCK_TEMPLATES_RESPONSE);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'US_EN']),
    ).toBeUndefined();
  });

  it('영어(en) 설정 시 language=US_EN 파라미터로 요청한다', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.resolvedLanguage).toBe('en');
    const queryClient = createQueryClient();
    const capturedLanguages: (string | null)[] = [];

    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const url = new URL(request.url);
        capturedLanguages.push(url.searchParams.get('language'));
        return HttpResponse.json(MOCK_TEMPLATES_RESPONSE);
      }),
    );

    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(capturedLanguages).toEqual(['US_EN']);
    expect(result.current.data).toEqual(MOCK_TEMPLATES_RESPONSE);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'US_EN']),
    ).toEqual(MOCK_TEMPLATES_RESPONSE);
  });

  it('소비처의 표시 정렬을 적용하지 않고 원본 응답과 캐시 순서를 유지한다', async () => {
    const queryClient = createQueryClient();
    const original = {
      organizations: ['Zulu', '한앎', 'alpha'].map((organization) => ({
        ...MOCK_TEMPLATES_RESPONSE.organizations[0],
        organization,
      })),
    };
    queryClient.setQueryData(['OrganizationTemplates', 'KO_KR'], original);
    const { result } = renderHook(() => useGetOrganizationTemplates(false), {
      wrapper: createWrapper(queryClient),
    });
    expect(result.current.data).toEqual(original);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'KO_KR']),
    ).toEqual(original);
  });

  it('enabled=false 이면 API를 호출하지 않는다', () => {
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useGetOrganizationTemplates(false), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(queryClient.isFetching()).toBe(0);
    expect(result.current.data).toBeUndefined();
  });
});

describe('템플릿 조회 언어 전환과 실패', () => {
  beforeAll(() => {
    i18n.addResourceBundle('ko', 'translation', { marker: '국문' });
    i18n.addResourceBundle('en', 'translation', { marker: 'English' });
  });
  afterEach(async () => {
    await i18n.changeLanguage('ko');
  });

  it('마운트된 훅이 언어 변경을 구독하고 국문 캐시와 영문 캐시를 분리한다', async () => {
    await i18n.changeLanguage('ko');
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) =>
        HttpResponse.json(
          new URL(request.url).searchParams.get('language') === 'US_EN'
            ? { organizations: [] }
            : MOCK_TEMPLATES_RESPONSE,
        ),
      ),
    );
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() =>
      expect(result.current.data).toEqual(MOCK_TEMPLATES_RESPONSE),
    );
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    await waitFor(() =>
      expect(result.current.data).toEqual({ organizations: [] }),
    );
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'KO_KR']),
    ).toEqual(MOCK_TEMPLATES_RESPONSE);
    expect(
      queryClient.getQueryData(['OrganizationTemplates', 'US_EN']),
    ).toEqual({ organizations: [] });
    await act(async () => {
      await i18n.changeLanguage('ko');
    });
    await waitFor(() =>
      expect(result.current.data).toEqual(MOCK_TEMPLATES_RESPONSE),
    );
  });

  it('영문 API가 실패해도 한국어에서는 국문만 정상 조회한다', async () => {
    await i18n.changeLanguage('ko');
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) =>
        new URL(request.url).searchParams.get('language') === 'US_EN'
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json(MOCK_TEMPLATES_RESPONSE),
      ),
    );
    const { result } = renderHook(() => useGetOrganizationTemplates(), {
      wrapper: createWrapper(createQueryClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MOCK_TEMPLATES_RESPONSE);
  });
});
