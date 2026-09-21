import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AudienceFinishedPage from './AudienceFinishedPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AudienceFinishedPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('토론 종료 안내 문구와 감사 문구를 표시한다', () => {
    render(<AudienceFinishedPage />);

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

    render(<AudienceFinishedPage />);

    await user.click(screen.getByRole('button', { name: '페이지 닫기' }));

    expect(windowCloseSpy).toHaveBeenCalled();
  });
});
