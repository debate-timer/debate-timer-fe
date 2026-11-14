import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { GlobalPortal } from '../../util/GlobalPortal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AudienceFinishedPage from './AudienceFinishedPage';

const i18nMock = vi.hoisted(() => ({
  language: 'ko',
  resolvedLanguage: 'ko',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: i18nMock,
  }),
}));

function renderPage(initialRoute = '/live/1/end', state?: unknown) {
  const client = new QueryClient();
  client.setQueryData(['DebateTableDataForShare', 1], {
    id: 1,
    info: { name: '종료된 토론', agenda: '공유 주제' },
  });
  return render(
    <QueryClientProvider client={client}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <MemoryRouter initialEntries={[{ pathname: initialRoute, state }]}>
            <Routes>
              <Route path="/live/:id/end" element={<AudienceFinishedPage />} />
              <Route
                path="/:lang/live/:id/end"
                element={<AudienceFinishedPage />}
              />
              <Route path="/" element={<div>기본 언어 홈</div>} />
              <Route path="/en" element={<div>영어 홈</div>} />
            </Routes>
          </MemoryRouter>
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );
}

describe('AudienceFinishedPage', () => {
  beforeEach(() => {
    localStorage.clear();
    i18nMock.language = 'ko';
    i18nMock.resolvedLanguage = 'ko';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('수신 사유 없는 직접 방문은 중립 안내와 캐시 정보를 표시한다', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: '공유가 종료되었습니다.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('참여해 주셔서 감사합니다.')).toBeInTheDocument();
  });

  it.each([
    ['ABORT', '실시간 공유가 중단되었습니다.'],
    ['FINISHED', '토론이 종료되었습니다.'],
  ])('실제 수신 사유 %s에 맞는 안내를 표시한다', (reason, message) => {
    renderPage('/live/1/end', { audienceTermination: { tableId: 1, reason } });
    expect(screen.getByRole('heading', { name: message })).toBeInTheDocument();
    expect(screen.getByText('종료된 토론')).toBeInTheDocument();
  });

  it('페이지 닫기 버튼을 누르면 window.close를 호출한다', async () => {
    const windowCloseSpy = vi
      .spyOn(window, 'close')
      .mockImplementation(() => {});
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole('button', { name: '페이지 닫기' }));

    expect(windowCloseSpy).toHaveBeenCalled();
  });

  it('창을 닫지 못하면 기본 언어 홈으로 이동한다', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'close').mockImplementation(() => {});

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '페이지 닫기' }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('기본 언어 홈')).toBeInTheDocument();
  });

  it('영어 사용자가 창을 닫지 못하면 영어 홈으로 이동한다', () => {
    i18nMock.language = 'en';
    i18nMock.resolvedLanguage = 'en';
    vi.useFakeTimers();
    vi.spyOn(window, 'close').mockImplementation(() => {});

    renderPage('/en/live/1/end');

    fireEvent.click(screen.getByRole('button', { name: '페이지 닫기' }));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('영어 홈')).toBeInTheDocument();
  });
});
