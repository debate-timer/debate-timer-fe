import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TimerProgressBar from './TimerProgressBar';

const animateMock = vi.hoisted(() => vi.fn());

vi.mock('framer-motion', async () => {
  const actual =
    await vi.importActual<typeof import('framer-motion')>('framer-motion');

  return {
    ...actual,
    animate: animateMock,
  };
});

describe('TimerProgressBar', () => {
  beforeEach(() => {
    animateMock.mockReset();
    animateMock.mockImplementation(
      (motionValue: { set: (value: number) => void }, target: number) => {
        motionValue.set(target);
        return { stop: vi.fn() };
      },
    );
  });

  it('기본 크기와 전달받은 className 및 접근성 진행률을 적용한다', () => {
    render(
      <TimerProgressBar
        progress={35}
        team="PROS"
        isRunning={false}
        className="max-w-[1280px]"
      />,
    );

    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveClass(
      'h-[24px]',
      'w-full',
      'overflow-hidden',
      'rounded-full',
      'max-w-[1280px]',
    );
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '35');
  });

  it.each([
    ['PROS', 'bg-camp-blue'],
    ['CONS', 'bg-camp-red'],
    ['DISABLED', 'bg-default-neutral'],
  ] as const)('%s 팀 색상을 진행 영역에 적용한다', (team, colorClass) => {
    render(<TimerProgressBar progress={50} team={team} isRunning={false} />);

    expect(screen.getByTestId('timer-progress-fill')).toHaveClass(colorClass);
  });

  it.each([
    [-10, 0],
    [120, 100],
  ])('진행률 %s를 %s 범위로 제한한다', (progress, expectedProgress) => {
    render(
      <TimerProgressBar
        progress={progress}
        team="DISABLED"
        isRunning={false}
      />,
    );

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      String(expectedProgress),
    );
    expect(animateMock).toHaveBeenCalledWith(
      expect.anything(),
      expectedProgress,
      expect.objectContaining({ duration: 0 }),
    );
  });

  it('실행 중에는 0.7초 easeOut으로 애니메이션하고 정지 상태에서는 즉시 동기화한다', () => {
    const { rerender } = render(
      <TimerProgressBar progress={30} team="PROS" isRunning={true} />,
    );

    expect(animateMock).toHaveBeenLastCalledWith(expect.anything(), 30, {
      duration: 0.7,
      ease: 'easeOut',
    });

    rerender(<TimerProgressBar progress={60} team="PROS" isRunning={false} />);

    expect(animateMock).toHaveBeenLastCalledWith(expect.anything(), 60, {
      duration: 0,
      ease: 'easeOut',
    });
  });
});
