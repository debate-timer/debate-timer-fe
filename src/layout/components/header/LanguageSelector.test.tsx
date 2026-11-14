import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import GlobalSettingsProvider from '../../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import LanguageSelector from './LanguageSelector';
import i18n from '../../../i18n';

function Location() {
  const location = useLocation();
  return (
    <output>
      {JSON.stringify({
        path: `${location.pathname}${location.search}${location.hash}`,
        state: location.state,
      })}
    </output>
  );
}
beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage('ko');
});
afterEach(cleanup);

describe('헤더 언어 선택', () => {
  it('닫힌 언어 목록은 접근성과 포커스 순서에서 제거한다', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <GlobalSettingsProvider>
          <MemoryRouter>
            <LanguageSelector />
          </MemoryRouter>
        </GlobalSettingsProvider>
      </QueryClientProvider>,
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('키보드 선택 후 query·hash와 실제 종료 사유를 보존한다', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <GlobalSettingsProvider>
          <MemoryRouter
            initialEntries={[
              {
                pathname: '/live/12/end',
                search: '?source=link',
                hash: '#done',
                state: {
                  audienceTermination: { tableId: 12, reason: 'ABORT' },
                },
              },
            ]}
          >
            <LanguageSelector />
            <Location />
          </MemoryRouter>
        </GlobalSettingsProvider>
      </QueryClientProvider>,
    );
    await user.click(screen.getByRole('button', { name: '언어 선택' }));
    await user.keyboard('{End}{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent(
      '/en/live/12/end?source=link#done',
    );
    expect(screen.getByRole('status')).toHaveTextContent('ABORT');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
