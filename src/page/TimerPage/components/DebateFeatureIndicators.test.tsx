import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DebateFeatureIndicators from './DebateFeatureIndicators';

describe('토론 기능 상태 표시', () => {
  it('각 기능의 이름과 상태를 제공하고 키보드로 설명에 접근한다', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DebateFeatureIndicators
        statuses={{ share: 'inactive', transcript: 'active', answer: 'error' }}
      />,
    );
    expect(
      screen.getByRole('list', { name: '토론 기능 상태' }),
    ).toHaveAttribute('aria-live', 'polite');
    const share = screen.getByRole('listitem', {
      name: '실시간 공유: 비활성화',
    });
    expect(
      screen.getByRole('listitem', { name: '속기록: 활성화' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: '답변 시간: 오류' }),
    ).toBeInTheDocument();
    await user.tab();
    expect(share).toHaveFocus();
    expect(screen.getByText('실시간 공유: 비활성화')).toBeInTheDocument();
    rerender(
      <DebateFeatureIndicators
        statuses={{
          share: 'active',
          transcript: 'inactive',
          answer: 'inactive',
        }}
      />,
    );
    expect(
      screen.getByRole('listitem', { name: '실시간 공유: 활성화' }),
    ).toBeInTheDocument();
  });
});
