import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import LiveShareButton from './LiveShareButton';

describe('LiveShareButton', () => {
  test('버튼이 렌더링된다', () => {
    render(<LiveShareButton onClick={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: '라이브 공유' }),
    ).toBeInTheDocument();
  });

  test('버튼을 클릭하면 onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<LiveShareButton onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: '라이브 공유' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('공유 중이 아니면 펄스 점을 표시하지 않는다', () => {
    render(<LiveShareButton onClick={vi.fn()} />);

    expect(screen.queryByTestId('live-share-pulse')).not.toBeInTheDocument();
  });

  test('공유 중이면 펄스 점을 표시하고 공유 중임을 알린다', () => {
    render(<LiveShareButton onClick={vi.fn()} isSharing />);

    expect(screen.getByTestId('live-share-pulse')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '라이브 공유 중' }),
    ).toBeInTheDocument();
  });
});
