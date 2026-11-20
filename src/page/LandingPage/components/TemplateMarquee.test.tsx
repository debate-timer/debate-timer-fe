import i18n from '../../../i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import TemplateMarquee from './TemplateMarquee';
import { server } from '../../../mocks/server';
import { ApiUrl } from '../../../apis/endpoints';
import { analyticsManager } from '../../../util/analytics';
import { createTemplateShareUrl } from '../../../util/templateShareUrl';

vi.mock('../../../util/analytics', () => ({
  analyticsManager: { trackEvent: vi.fn() },
}));

const TEMPLATE = { name: 'CEDA 토론', data: 'encoded' };

function Wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('토론 템플릿 슬라이드', () => {
  beforeEach(async () => {
    i18n.addResourceBundle('ko', 'translation', { marker: '국문' });
    i18n.addResourceBundle('en', 'translation', { marker: 'English' });
    await i18n.changeLanguage('ko');
    vi.clearAllMocks();
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
                  iconPath: '/icon/hantomak_icon.png',
                  templates: [TEMPLATE],
                },
              ],
            }),
      ),
    );
  });

  it('템플릿을 누르면 공유 링크로 이동하고 선택 이벤트를 기록한다', async () => {
    const user = userEvent.setup();
    render(<TemplateMarquee />, { wrapper: Wrapper });

    const links = await screen.findAllByRole('link', {
      name: 'CEDA 토론 토론하기',
    });
    expect(links[0]).toHaveAttribute(
      'href',
      createTemplateShareUrl('한토막', TEMPLATE),
    );

    links[0].addEventListener('click', (event) => event.preventDefault());
    await user.click(links[0]);

    expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
      'template_selected',
      {
        organization_name: '한토막',
        template_name: 'CEDA 토론',
        template_label: '한토막 - CEDA 토론',
      },
    );
  });

  it('템플릿마다 링크를 한 번만 노출한다', async () => {
    render(<TemplateMarquee />, { wrapper: Wrapper });

    expect(
      await screen.findAllByRole('link', { name: 'CEDA 토론 토론하기' }),
    ).toHaveLength(1);
  });

  it('전체보기 링크는 템플릿 전체보기 페이지로 이동한다', () => {
    render(<TemplateMarquee />, { wrapper: Wrapper });

    expect(screen.getByRole('link', { name: '전체보기' })).toHaveAttribute(
      'href',
      '/templates',
    );
  });

  it('템플릿을 불러오지 못하면 오류 문구를 보여 준다', async () => {
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) =>
        new URL(request.url).searchParams.get('language') === 'US_EN'
          ? HttpResponse.json({ organizations: [] })
          : HttpResponse.json({}, { status: 500 }),
      ),
    );
    render(<TemplateMarquee />, { wrapper: Wrapper });

    expect(
      await screen.findByText(
        '템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      ),
    ).toBeInTheDocument();
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
              category: isEnglish ? 'GLOBAL' : 'DEBATE_CLUB',
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
      render(<TemplateMarquee />, { wrapper: Wrapper });
      const label = language === 'ko' ? /국문 형식/ : /Public Forum/;
      expect(
        await screen.findByRole('link', { name: label }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', {
          name: language === 'ko' ? /Public Forum/ : /국문 형식/,
        }),
      ).not.toBeInTheDocument();
    },
  );

  it('영문 API가 실패해도 국문 템플릿을 정상 표시한다', async () => {
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
    render(<TemplateMarquee />, { wrapper: Wrapper });
    expect(
      await screen.findByRole('link', { name: /국문 형식/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        '템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      ),
    ).not.toBeInTheDocument();
  });
  it.each(['ko', 'en'])(
    '%s 화면에서 조직명을 알파벳순으로 정렬하고 조직 안의 템플릿 순서는 유지한다',
    async (language) => {
      await i18n.changeLanguage(language);
      server.use(
        http.get(ApiUrl.organization + '/templates', () => {
          const names = ['Zulu', '한앎', 'alpha', '가나다', 'Beta'];
          return HttpResponse.json({
            organizations: names.map((organization) => ({
              organization,
              category: 'GLOBAL',
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
      render(<TemplateMarquee />, { wrapper: Wrapper });
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
