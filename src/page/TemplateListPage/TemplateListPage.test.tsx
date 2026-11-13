import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { render, screen } from '@testing-library/react';
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
  beforeEach(() => {
    server.use(
      http.get(ApiUrl.organization + '/templates', () =>
        HttpResponse.json({
          organizations: [
            {
              organization: '한토막',
              affiliation: '한양대',
              iconPath: '',
              templates: [{ name: 'CEDA 토론', data: 'a' }],
            },
            {
              organization: '이감',
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

  it('같은 행에 높이가 비슷한 카드가 모이도록 템플릿이 적은 단체부터 보여 준다', async () => {
    server.use(
      http.get(ApiUrl.organization + '/templates', () =>
        HttpResponse.json({
          organizations: [
            {
              organization: '단체 가',
              affiliation: '',
              iconPath: '',
              templates: [{ name: '가1', data: 'a' }],
            },
            {
              organization: '단체 나',
              affiliation: '',
              iconPath: '',
              templates: [
                { name: '나1', data: 'b' },
                { name: '나2', data: 'c' },
              ],
            },
            {
              organization: '단체 다',
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
    expect(names).toEqual(['단체 가', '단체 다', '단체 나']);
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
      '/home',
    );
  });
});
