import { render, screen } from '@testing-library/react';
import AudienceTimeBasedTimer from './AudienceTimeBasedTimer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) =>
      Object.entries(values ?? {}).reduce(
        (translated, [name, value]) => translated.replace(`{{${name}}}`, value),
        key,
      ),
  }),
}));

describe('AudienceTimeBasedTimer', () => {
  it('PROS를 왼쪽, CONS를 오른쪽의 동일 너비 영역에 표시한다', () => {
    render(
      <AudienceTimeBasedTimer
        prosTeamName="한빛"
        consTeamName="다온"
        timePerTeam={120}
        timePerSpeaking={null}
        prosTotalRemainingTime={90}
        consTotalRemainingTime={80}
        prosCurrentSpeakingRemainingTime={null}
        consCurrentSpeakingRemainingTime={null}
        currentTeam="PROS"
        isRunning={true}
      />,
    );

    const row = screen.getByTestId('time-based-timer-row');
    const [pros, cons] = Array.from(row.children);

    expect(pros).toHaveAttribute('data-testid', 'pros-timer-display');
    expect(cons).toHaveAttribute('data-testid', 'cons-timer-display');
    expect(pros).toHaveClass('flex-1');
    expect(cons).toHaveClass('flex-1');
    expect(screen.getByText('한빛 팀')).toBeInTheDocument();
    expect(screen.getByText('다온 팀')).toBeInTheDocument();
  });

  it('양 팀에 1회당 발언 시간이 있으면 각각 전체/현재 시간을 표시한다', () => {
    render(
      <AudienceTimeBasedTimer
        prosTeamName="찬성"
        consTeamName="반대"
        timePerTeam={120}
        timePerSpeaking={30}
        prosTotalRemainingTime={100}
        consTotalRemainingTime={90}
        prosCurrentSpeakingRemainingTime={20}
        consCurrentSpeakingRemainingTime={15}
        currentTeam="CONS"
        isRunning={false}
      />,
    );

    expect(screen.getAllByText('전체 시간')).toHaveLength(2);
    expect(screen.getAllByText('현재 시간')).toHaveLength(2);
    expect(screen.getByTestId('pros-current-timer')).toHaveAttribute(
      'aria-label',
      '00 : 20',
    );
    expect(screen.getByTestId('cons-current-timer')).toHaveAttribute(
      'aria-label',
      '00 : 15',
    );
    expect(screen.getByTestId('cons-speaking-status')).toBeInTheDocument();
    expect(
      screen.queryByTestId('pros-speaking-status'),
    ).not.toBeInTheDocument();
  });
});
