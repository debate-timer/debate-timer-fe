import { render, screen } from '@testing-library/react';
import AudienceTimeBasedTimerDisplay from './AudienceTimeBasedTimerDisplay';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) =>
      Object.entries(values ?? {}).reduce(
        (translated, [name, value]) => translated.replace(`{{${name}}}`, value),
        key,
      ),
  }),
}));

describe('AudienceTimeBasedTimerDisplay', () => {
  it('1회당 발언 시간이 없으면 제목, 전체 타이머, 프로그레스 바를 표시한다', () => {
    render(
      <AudienceTimeBasedTimerDisplay
        team="PROS"
        teamName="한빛"
        timePerTeam={120}
        timePerSpeaking={null}
        totalRemainingTime={90}
        currentSpeakingRemainingTime={null}
        isCurrentTeam={true}
        isRunning={true}
      />,
    );

    expect(screen.getByText('한빛 팀')).toBeInTheDocument();
    expect(screen.getByTestId('pros-total-timer')).toHaveAttribute(
      'aria-label',
      '01 : 30',
    );
    expect(screen.queryByText('전체 시간')).not.toBeInTheDocument();
    expect(screen.queryByText('현재 시간')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
  });

  it('1회당 발언 시간이 있으면 전체/현재 배지와 두 타이머를 표시한다', () => {
    render(
      <AudienceTimeBasedTimerDisplay
        team="CONS"
        teamName="다온"
        timePerTeam={300}
        timePerSpeaking={60}
        totalRemainingTime={240}
        currentSpeakingRemainingTime={45}
        isCurrentTeam={true}
        isRunning={false}
      />,
    );

    expect(screen.getByText('전체 시간')).toHaveClass(
      'h-[48px]',
      'w-[144px]',
      'bg-default-black',
      'text-[24px]',
    );
    expect(screen.getByText('현재 시간')).toHaveClass(
      'h-[64px]',
      'w-[200px]',
      'bg-camp-red',
      'text-[32px]',
    );
    expect(screen.getByTestId('cons-total-timer')).toHaveAttribute(
      'aria-label',
      '04 : 00',
    );
    expect(screen.getByTestId('cons-current-timer')).toHaveAttribute(
      'aria-label',
      '00 : 45',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
  });

  it('빈 팀 이름은 폴백을 표시하고 비활성 팀의 모든 요소를 무채색으로 표시한다', () => {
    render(
      <AudienceTimeBasedTimerDisplay
        team="CONS"
        teamName="  "
        timePerTeam={60}
        timePerSpeaking={30}
        totalRemainingTime={60}
        currentSpeakingRemainingTime={30}
        isCurrentTeam={false}
        isRunning={false}
      />,
    );

    expect(screen.getByText('팀명 없음')).toHaveClass(
      'text-default-disabled/hover',
    );
    expect(screen.getByTestId('cons-timer-display')).not.toHaveClass(
      'bg-gray-100',
      'opacity-50',
      'grayscale',
    );
    expect(screen.getByText('전체 시간')).toHaveClass(
      'bg-default-disabled/hover',
    );
    expect(screen.getByText('현재 시간')).toHaveClass(
      'bg-default-disabled/hover',
    );
    expect(screen.getByTestId('cons-total-timer')).toHaveClass(
      'text-default-disabled/hover',
    );
    expect(screen.getByTestId('cons-current-timer')).toHaveClass(
      'text-default-disabled/hover',
    );
    expect(screen.getByTestId('timer-progress-fill')).toHaveClass(
      'bg-default-neutral',
    );
    expect(
      screen.queryByTestId('cons-speaking-status'),
    ).not.toBeInTheDocument();
  });

  it('현재 팀은 접근성 상태와 팀 색상으로 식별된다', () => {
    render(
      <AudienceTimeBasedTimerDisplay
        team="PROS"
        teamName="찬성"
        timePerTeam={60}
        timePerSpeaking={30}
        totalRemainingTime={60}
        currentSpeakingRemainingTime={30}
        isCurrentTeam={true}
        isRunning={true}
      />,
    );

    expect(screen.getByTestId('pros-timer-display')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByTestId('pros-speaking-status')).toHaveTextContent(
      '현재 발언 중',
    );
    expect(screen.getByText('현재 시간')).toHaveClass('bg-camp-blue');
  });

  it('0초 아래의 값과 100%를 넘는 진행도를 각각 0초와 100%로 제한한다', () => {
    render(
      <AudienceTimeBasedTimerDisplay
        team="PROS"
        teamName="찬성"
        timePerTeam={60}
        timePerSpeaking={30}
        totalRemainingTime={-5}
        currentSpeakingRemainingTime={-1}
        isCurrentTeam={true}
        isRunning={false}
      />,
    );

    expect(screen.getByTestId('pros-total-timer')).toHaveAttribute(
      'aria-label',
      '00 : 00',
    );
    expect(screen.getByTestId('pros-current-timer')).toHaveAttribute(
      'aria-label',
      '00 : 00',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});
