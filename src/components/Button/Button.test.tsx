import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('공용 버튼', () => {
  it('폼 안에서도 기본 클릭으로 제출하지 않고 이름과 속성을 전달한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button aria-label="시작" onClick={onClick} title="토론 시작">
          시작
        </Button>
      </form>,
    );
    const button = screen.getByRole('button', { name: '시작' });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('title', '토론 시작');
  });

  it('명시적인 제출을 지원하고 비활성일 때 클릭을 차단한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <Button type="submit" aria-label="확인">
          확인
        </Button>
      </form>,
    );
    await user.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const onClick = vi.fn();
    rerender(
      <Button aria-label="확인" disabled onClick={onClick}>
        확인
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
