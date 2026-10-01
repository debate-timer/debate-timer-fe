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

function renderPage(initialRoute = '/live/1/end') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/live/:id/end" element={<AudienceFinishedPage />} />
        <Route path="/:lang/live/:id/end" element={<AudienceFinishedPage />} />
        <Route path="/home" element={<div>기본 언어 홈</div>} />
        <Route path="/en/home" element={<div>영어 홈</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AudienceFinishedPage', () => {
  beforeEach(() => {
    i18nMock.language = 'ko';
    i18nMock.resolvedLanguage = 'ko';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('토론 종료 안내 문구와 감사 문구를 표시한다', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: '토론이 종료되었습니다.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('참여해 주셔서 감사합니다.')).toBeInTheDocument();
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
