import { render, screen } from '@testing-library/react';
import NotificationBadge from './NotificationBadge';

describe('NotificationBadge', () => {
  it.each([0, -1, NaN, Infinity])(
    '표시할 알림이 없으면 배지를 숨긴다 (%s)',
    (count) => {
      render(<NotificationBadge count={count} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    },
  );

  it('알림이 99개를 넘으면 99+로 표시한다', () => {
    render(<NotificationBadge count={100} />);

    expect(screen.getByRole('status')).toHaveTextContent('99+');
  });

  it('호출부에서 알림 정보를 이미 제공하면 배지를 접근성 트리에서 숨길 수 있다', () => {
    render(<NotificationBadge count={2} aria-hidden="true" />);

    expect(screen.getByText('2')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
