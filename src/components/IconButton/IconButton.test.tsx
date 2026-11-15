import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from './IconButton';

describe('아이콘 버튼', () => {
  it('폼 안에서 기본 클릭으로 제출하지 않고 버튼 속성과 동작을 전달한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onClick = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <IconButton
          icon={<svg aria-hidden="true" />}
          aria-label="설정"
          aria-expanded={false}
          onClick={onClick}
        />
      </form>,
    );

    const button = screen.getByRole('button', { name: '설정' });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('비활성 상태에서는 클릭을 차단한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton
        icon={<svg aria-hidden="true" />}
        aria-label="설정"
        disabled
        onClick={onClick}
      />,
    );
    await user.click(screen.getByRole('button', { name: '설정' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
