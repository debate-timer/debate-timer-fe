import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AudienceNormalTimer from './AudienceNormalTimer';

describe('AudienceNormalTimer', () => {
  it('발언 유형, 팀명, 토론자명과 포맷팅된 시간을 렌더링한다', () => {
    render(
      <AudienceNormalTimer
        remainingTime={65}
        totalTime={130}
        speechType="입론"
        stance="PROS"
        teamName="찬성"
        speaker="김토론"
        isRunning={false}
      />,
    );

    expect(screen.getByRole('heading', { name: '입론' })).toBeInTheDocument();
    expect(screen.queryByText('남은 시간')).not.toBeInTheDocument();
    const debateIcon = screen.getByTestId('debate-icon');
    const participantRow = screen.getByTestId('participant-row');
    const timerValue = screen.getByTestId('timer-value');

    expect(debateIcon).toHaveAttribute('aria-hidden', 'true');
    expect(debateIcon).toHaveClass('h-[34px]');
    expect(participantRow).toHaveClass('mt-[24px]', 'text-[34px]');
    expect(screen.getByText('찬성 팀')).toBeInTheDocument();
    expect(screen.getByText('김토론 토론자')).toBeInTheDocument();
    expect(timerValue).toHaveClass(
      'mt-[64px]',
      'grid-cols-[2ch_1ch_2ch]',
      'gap-x-[0.33ch]',
    );
    expect(timerValue).toHaveAttribute('aria-label', '01 : 05');
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText(':')).toHaveClass('text-center');
    expect(screen.getByText('05')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    expect(screen.getByRole('progressbar')).toHaveClass('mt-[108px]');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('알 수 없는 발언 유형은 원문을 표시한다', () => {
    render(
      <AudienceNormalTimer
        remainingTime={30}
        totalTime={60}
        speechType="사용자 지정 발언"
        stance="CONS"
        teamName="반대"
        speaker="이토론"
        isRunning={true}
      />,
    );

    expect(
      screen.getByRole('heading', { name: '사용자 지정 발언' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('timer-progress-fill')).toHaveClass(
      'bg-camp-red',
    );
  });

  it('NEUTRAL 진영은 팀명과 토론자 정보를 표시하지 않는다', () => {
    render(
      <AudienceNormalTimer
        remainingTime={60}
        totalTime={60}
        speechType="입론"
        stance="NEUTRAL"
        teamName="   "
        speaker={null}
        isRunning={false}
      />,
    );

    expect(screen.queryByTestId('participant-row')).not.toBeInTheDocument();
    expect(screen.queryByText('팀명 없음')).not.toBeInTheDocument();
    expect(screen.queryByText('토론자 없음')).not.toBeInTheDocument();
    expect(screen.getByTestId('timer-progress-fill')).toHaveClass(
      'bg-default-neutral',
    );
  });

  it.each([
    { remainingTime: 80, expectedProgress: 0 },
    { remainingTime: -20, expectedProgress: 100 },
  ])(
    '경과 진행률을 0~100으로 제한한다: $remainingTime',
    ({ remainingTime, expectedProgress }) => {
      render(
        <AudienceNormalTimer
          remainingTime={remainingTime}
          totalTime={60}
          speechType="입론"
          stance="PROS"
          teamName="찬성"
          speaker="김토론"
          isRunning={false}
        />,
      );

      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        String(expectedProgress),
      );
    },
  );

  it('남은 시간이 음수이면 마이너스를 표시하고 진행률을 100%로 고정한다', () => {
    render(
      <AudienceNormalTimer
        remainingTime={-5}
        totalTime={60}
        speechType="입론"
        stance="PROS"
        teamName="찬성"
        speaker="김토론"
        isRunning={true}
      />,
    );

    expect(screen.getByTestId('negative-sign')).toHaveTextContent('-');
    expect(screen.getByTestId('timer-value')).toHaveAttribute(
      'aria-label',
      '- 00 : 05',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});
