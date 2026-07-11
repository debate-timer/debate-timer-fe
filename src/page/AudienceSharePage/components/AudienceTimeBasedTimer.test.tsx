import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AudienceTimeBasedTimer from './AudienceTimeBasedTimer';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AudienceTimeBasedTimer', () => {
  it('양 팀에 수신값이 있으면 각각 독립적으로 포맷되어 표시된다 (@AC-039)', () => {
    render(
      <AudienceTimeBasedTimer
        prosRemainingTime={65}
        consRemainingTime={40}
        currentTeam="PROS"
      />,
    );
    expect(screen.getByText('01:05')).toBeInTheDocument();
    expect(screen.getByText('00:40')).toBeInTheDocument();
  });

  it('수신 이력이 없는 팀의 null 값은 --:--로 표시된다 (@AC-040)', () => {
    render(
      <AudienceTimeBasedTimer
        prosRemainingTime={null}
        consRemainingTime={null}
        currentTeam="CONS"
      />,
    );
    const nullDisplays = screen.getAllByText('--:--');
    expect(nullDisplays).toHaveLength(2);
  });

  it('PROS인 현재 발언 팀은 접근성 상태와 텍스트로 식별된다 (@AC-041)', () => {
    render(
      <AudienceTimeBasedTimer
        prosRemainingTime={10}
        consRemainingTime={10}
        currentTeam="PROS"
      />,
    );
    const prosSpeakingStatus = screen.getByTestId('pros-speaking-status');
    expect(prosSpeakingStatus).toBeInTheDocument();
    expect(
      screen.queryByTestId('cons-speaking-status'),
    ).not.toBeInTheDocument();
  });

  it('CONS인 현재 발언 팀은 접근성 상태와 텍스트로 식별된다 (@AC-041)', () => {
    render(
      <AudienceTimeBasedTimer
        prosRemainingTime={10}
        consRemainingTime={10}
        currentTeam="CONS"
      />,
    );
    const consSpeakingStatus = screen.getByTestId('cons-speaking-status');
    expect(consSpeakingStatus).toBeInTheDocument();
    expect(
      screen.queryByTestId('pros-speaking-status'),
    ).not.toBeInTheDocument();
  });
});
