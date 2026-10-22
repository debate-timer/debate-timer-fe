import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TranscriptBanner from './TranscriptBanner';

describe('TranscriptBanner', () => {
  it('기록이 없으면 아무것도 보여주지 않는다', () => {
    const { container } = render(
      <TranscriptBanner status="none" onOpen={vi.fn()} onRetry={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('보내는 중에는 정리 중임을 알린다', () => {
    render(
      <TranscriptBanner
        status="submitting"
        onOpen={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('토론 기록을 보내고 있어요')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('준비되면 속기록과 분석 보고서 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <TranscriptBanner status="ready" onOpen={onOpen} onRetry={vi.fn()} />,
    );

    await user.click(
      screen.getByRole('button', { name: '속기록·분석 보고서 보기' }),
    );

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('실패하면 다시 보낼 수 있다', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <TranscriptBanner status="error" onOpen={vi.fn()} onRetry={onRetry} />,
    );

    await user.click(screen.getByRole('button', { name: '다시 보내기' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
