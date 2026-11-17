import i18n from '../../i18n';
import { readFileSync } from 'node:fs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { act, render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import TemplateListPage from './TemplateListPage';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { LANDING_URLS } from '../../constants/urls';

function Wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </GlobalSettingsProvider>
    </QueryClientProvider>
  );
}

describe('토론 템플릿 전체보기 페이지', () => {
  beforeEach(async () => {
    i18n.addResourceBundle('ko', 'translation', { marker: '국문' });
    i18n.addResourceBundle('en', 'translation', { marker: 'English' });
    await i18n.changeLanguage('ko');
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) =>
        new URL(request.url).searchParams.get('language') === 'US_EN'
          ? HttpResponse.json({ organizations: [] })
          : HttpResponse.json({
              organizations: [
                {
                  organization: '한토막',
                  category: 'DEBATE_CLUB',
                  affiliation: '한양대',
                  iconPath: '',
                  templates: [{ name: 'CEDA 토론', data: 'a' }],
                },
                {
                  organization: '이감',
                  category: 'DEBATE_CLUB',
                  affiliation: '경희대',
                  iconPath: '',
                  templates: [{ name: '하이브리드 토론', data: 'b' }],
                },
              ],
            }),
      ),
    );
  });

  it('단체별 템플릿 카드를 모두 보여 준다', async () => {
    render(<TemplateListPage />, { wrapper: Wrapper });

    expect(
      await screen.findByRole('heading', { name: '한토막' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '이감' })).toBeInTheDocument();
  });

  it.each(['ko', 'en'])(
    '%s 화면에서 서버 분류별 제목과 설명 아래에 카드를 묶는다',
    async (language) => {
      const translations = JSON.parse(
        readFileSync(`public/locales/${language}/translation.json`, 'utf8'),
      ) as Record<string, string>;
      i18n.addResourceBundle(language, 'translation', translations, true, true);
      await i18n.changeLanguage(language);
      server.use(
        http.get(ApiUrl.organization + '/templates', ({ request }) =>
          HttpResponse.json({
            organizations:
              new URL(request.url).searchParams.get('language') === 'US_EN'
                ? [
                    {
                      organization: 'Zulu Club',
                      category: 'DEBATE_CLUB',
                      affiliation: '',
                      iconPath: '',
                      templates: [],
                    },
                    {
                      organization: 'Basic Format',
                      category: 'CLASSIC',
                      affiliation: '',
                      iconPath: '',
                      templates: [],
                    },
                    {
                      organization: 'alpha Club',
                      category: 'DEBATE_CLUB',
                      affiliation: '',
                      iconPath: '',
                      templates: [],
                    },
                    {
                      organization: 'Contest',
                      category: 'TOURNAMENT',
                      affiliation: '',
                      iconPath: '',
                      templates: [],
                    },
                  ]
                : [],
          }),
        ),
      );
      render(<TemplateListPage />, { wrapper: Wrapper });
      await screen.findByRole('heading', { name: 'Contest' });
      const titles =
        language === 'ko'
          ? ['대회', '동아리', '고전 토론']
          : ['Tournaments', 'Debate Clubs', 'Classics'];
      expect(
        screen
          .getAllByRole('heading', { level: 2 })
          .map((heading) => heading.textContent),
      ).toEqual(titles);
      const groups = titles.map((title) =>
        within(screen.getByRole('region', { name: title })),
      );
      expect(
        groups[0]
          .getAllByRole('heading', { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(['Contest']);
      expect(
        groups[1]
          .getAllByRole('heading', { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(['alpha Club', 'Zulu Club']);
      expect(
        groups[2]
          .getAllByRole('heading', { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(['Basic Format']);
      const descriptions =
        language === 'ko'
          ? [
              '토론 대회에서 사용하는 형식으로 토론을 준비해 보세요.',
              '국내 토론 동아리에서 사용하는 다양한 토론 형식을 만나보세요.',
              '오랫동안 이어져 온 기본 토론 형식으로 시작해 보세요.',
            ]
          : [
              'Prepare for your debate with formats used in tournaments.',
              'Explore a variety of formats used by debate clubs in Korea.',
              'Start with the foundational debate formats that have stood the test of time.',
            ];
      descriptions.forEach((description, index) =>
        expect(groups[index].getByText(description)).toBeInTheDocument(),
      );
    },
  );

  it('조직이 없는 카테고리는 표시하지 않는다', async () => {
    render(<TemplateListPage />, { wrapper: Wrapper });
    await screen.findByRole('heading', { name: '한토막' });
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['동아리']);
  });

  it('템플릿 개수와 무관하게 조직명순으로 보여 준다', async () => {
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) =>
        new URL(request.url).searchParams.get('language') === 'US_EN'
          ? HttpResponse.json({ organizations: [] })
          : HttpResponse.json({
              organizations: [
                {
                  organization: '단체 가',
                  category: 'DEBATE_CLUB',
                  affiliation: '',
                  iconPath: '',
                  templates: [{ name: '가1', data: 'a' }],
                },
                {
                  organization: '단체 나',
                  category: 'DEBATE_CLUB',
                  affiliation: '',
                  iconPath: '',
                  templates: [
                    { name: '나1', data: 'b' },
                    { name: '나2', data: 'c' },
                  ],
                },
                {
                  organization: '단체 다',
                  category: 'DEBATE_CLUB',
                  affiliation: '',
                  iconPath: '',
                  templates: [{ name: '다1', data: 'd' }],
                },
              ],
            }),
      ),
    );
    render(<TemplateListPage />, { wrapper: Wrapper });

    await screen.findByRole('heading', { name: '단체 나' });
    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(names).toEqual(['단체 가', '단체 나', '단체 다']);
  });

  it('템플릿 문의하기는 템플릿 신청 폼을 새 창으로 연다', () => {
    render(<TemplateListPage />, { wrapper: Wrapper });

    const link = screen.getByRole('link', { name: '템플릿 문의하기' });
    expect(link).toHaveAttribute('href', LANDING_URLS.TEMPLATE_REGISTER_URL);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('메인으로 링크는 랜딩 페이지로 이동한다', () => {
    render(<TemplateListPage />, { wrapper: Wrapper });

    expect(screen.getByRole('link', { name: '메인으로' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});

describe('언어별 템플릿 노출', () => {
  beforeEach(() => {
    i18n.addResourceBundle('ko', 'translation', { marker: '국문' });
    i18n.addResourceBundle('en', 'translation', { marker: 'English' });
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const isEnglish =
          new URL(request.url).searchParams.get('language') === 'US_EN';
        return HttpResponse.json({
          organizations: [
            {
              organization: isEnglish ? 'English organization' : '국문 단체',
              category: isEnglish ? 'CLASSIC' : 'DEBATE_CLUB',
              affiliation: '',
              iconPath: '',
              templates: [
                {
                  name: isEnglish ? 'Public Forum' : '국문 형식',
                  data: 'encoded',
                },
              ],
            },
          ],
        });
      }),
    );
  });
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('ko');
    });
  });

  it.each(['ko', 'en'])(
    '%s 화면에서 필요한 언어의 템플릿만 표시한다',
    async (language) => {
      await i18n.changeLanguage(language);
      render(<TemplateListPage />, { wrapper: Wrapper });
      const englishLink = await screen.findByRole('link', {
        name: /Public Forum/,
      });
      expect(englishLink).toHaveAttribute(
        'href',
        expect.stringContaining('org=English%20organization'),
      );
      if (language === 'ko') {
        expect(
          screen.getByRole('link', { name: /국문 형식/ }),
        ).toBeInTheDocument();
      } else {
        expect(
          screen.queryByRole('link', { name: /국문 형식/ }),
        ).not.toBeInTheDocument();
      }
    },
  );

  it('영문 조회만 실패하면 국문 부분 목록 대신 오류를 표시한다', async () => {
    await i18n.changeLanguage('ko');
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) =>
        new URL(request.url).searchParams.get('language') === 'US_EN'
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json({
              organizations: [
                {
                  organization: '국문 단체',
                  category: 'DEBATE_CLUB',
                  affiliation: '',
                  iconPath: '',
                  templates: [{ name: '국문 형식', data: 'encoded' }],
                },
              ],
            }),
      ),
    );
    render(<TemplateListPage />, { wrapper: Wrapper });
    expect(
      await screen.findByText(
        '템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /국문 형식/ }),
    ).not.toBeInTheDocument();
  });
  it.each(['ko', 'en'])(
    '%s 화면에서 조직명을 알파벳순으로 정렬하고 조직 안의 템플릿 순서는 유지한다',
    async (language) => {
      await i18n.changeLanguage(language);
      server.use(
        http.get(ApiUrl.organization + '/templates', ({ request }) => {
          const isEnglish =
            new URL(request.url).searchParams.get('language') === 'US_EN';
          const names = isEnglish
            ? ['Zulu', '한앎', 'alpha', '가나다', 'Beta']
            : [];
          return HttpResponse.json({
            organizations: names.map((organization) => ({
              organization,
              category: 'CLASSIC',
              affiliation: '',
              iconPath: '',
              templates: [
                { name: organization + ' 두번째', data: 'encoded' },
                { name: organization + ' 첫번째', data: 'encoded' },
              ],
            })),
          });
        }),
      );
      render(<TemplateListPage />, { wrapper: Wrapper });
      await screen.findByRole('link', { name: /Zulu 두번째/ });
      const labels = screen
        .getAllByRole('link')
        .map((link) => link.getAttribute('aria-label'))
        .filter(
          (label) => label?.includes('두번째') || label?.includes('첫번째'),
        );
      const names =
        language === 'en'
          ? ['alpha', 'Beta', 'Zulu', '가나다', '한앎']
          : ['가나다', '한앎', 'alpha', 'Beta', 'Zulu'];
      expect(labels).toEqual(
        names.flatMap((name) => [
          expect.stringContaining(name + ' 두번째'),
          expect.stringContaining(name + ' 첫번째'),
        ]),
      );
    },
  );
});
