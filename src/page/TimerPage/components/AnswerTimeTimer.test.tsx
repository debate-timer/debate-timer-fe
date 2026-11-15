import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AnswerTimeTimer from './AnswerTimeTimer';

describe('답변 시간 타이머', () => {
  it('설정을 끄면 버튼을 숨기고 다시 켜면 표시한다', () => {
    const props = {
      owner: 'NORMAL' as const,
      answerTime: 30,
      answerTimerState: null,
      isMainTimerRunning: true,
      onClick: vi.fn(),
    };
    const { rerender } = render(<AnswerTimeTimer {...props} isEnabled />);

    expect(
      screen.getByRole('button', { name: '답변시간 타이머 시작' }),
    ).toBeEnabled();

    rerender(<AnswerTimeTimer {...props} isEnabled={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<AnswerTimeTimer {...props} isEnabled />);
    expect(
      screen.getByRole('button', { name: '답변시간 타이머 시작' }),
    ).toBeEnabled();
  });

  it('기능이 켜져 있고 주 타이머만 정지한 경우 버튼을 비활성화해 표시한다', () => {
    render(
      <AnswerTimeTimer
        owner="PROS"
        answerTime={30}
        answerTimerState={null}
        isMainTimerRunning={false}
        onClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: '답변시간 타이머 시작' }),
    ).toBeDisabled();
  });
});
