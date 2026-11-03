import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
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
  beforeEach(() => {
    vi.clearAllMocks();
    server.use(
      http.get(ApiUrl.organization + '/templates', () =>
        HttpResponse.json({
          organizations: [
            {
              organization: '한토막',
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

  it('반복 재생용 복제 항목은 보조 기술에서 숨긴다', async () => {
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
      http.get(ApiUrl.organization + '/templates', () =>
        HttpResponse.json({}, { status: 500 }),
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
