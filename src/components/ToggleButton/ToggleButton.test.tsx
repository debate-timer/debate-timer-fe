import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleButton from './ToggleButton';

describe('공용 토글 버튼', () => {
  it('변경 요청만 전달하고 전달받은 상태로 표시한다', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const { rerender } = render(
      <ToggleButton
        aria-label="공유"
        isPressed={false}
        onPressedChange={onPressedChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: '공유' }));
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(
      <ToggleButton
        aria-label="공유"
        isPressed
        onPressedChange={onPressedChange}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('Enter·Space로 조작하며 폼을 제출하지 않고 비활성일 때 요청하지 않는다', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={submit}>
        <ToggleButton
          aria-label="답변"
          isPressed={false}
          onPressedChange={onPressedChange}
        />
      </form>,
    );
    await user.tab();
    await user.keyboard('{Enter} ');
    expect(onPressedChange).toHaveBeenCalledTimes(2);
    expect(submit).not.toHaveBeenCalled();
    rerender(
      <ToggleButton
        aria-label="답변"
        isPressed={false}
        disabled
        onPressedChange={onPressedChange}
      />,
    );
    await user.click(screen.getByRole('button'));
    expect(onPressedChange).toHaveBeenCalledTimes(2);
  });
});
