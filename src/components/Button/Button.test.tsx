import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';
import { createRef } from 'react';

describe('공용 버튼', () => {
  it('외부 ref로 버튼에 포커스를 복귀시킬 수 있다', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} aria-label="설정">
        설정
      </Button>,
    );
    ref.current?.focus();
    expect(screen.getByRole('button', { name: '설정' })).toHaveFocus();
  });
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

  it('href가 전달되면 링크 요소로 렌더링하고 target·rel·접근 가능한 이름을 유지한다', () => {
    render(
      <Button
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
        variant="neutral"
        shape="rounded"
        aria-label="일반 문의"
      >
        일반 문의
      </Button>,
    );
    const link = screen.getByRole('link', { name: '일반 문의' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
