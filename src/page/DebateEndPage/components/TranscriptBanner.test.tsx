import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TranscriptBanner from './TranscriptBanner';

describe('토론 기록 전송 배너', () => {
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

  it('서버가 기록을 만들지 못하고 끝냈으면 원인을 알리고 다시 보내기를 보여주지 않는다', () => {
    render(
      <TranscriptBanner status="failed" onOpen={vi.fn()} onRetry={vi.fn()} />,
    );

    expect(screen.getByText('토론 기록을 만들지 못했어요')).toBeInTheDocument();
    expect(
      screen.getByText(
        '녹음에서 인식된 발언이 없었거나 기록을 만드는 중 문제가 생겼어요.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '다시 보내기' }),
    ).not.toBeInTheDocument();
  });

  it('Soniox 전사를 기다리는 동안 남은 구간 수를 알린다', () => {
    render(
      <TranscriptBanner
        status="transcribing"
        pendingCount={2}
        onOpen={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByText('발언을 텍스트로 바꾸고 있어요 (2개 구간 남음)'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
