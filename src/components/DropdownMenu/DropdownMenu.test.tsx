import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropdownMenu from './DropdownMenu';

const OPTIONS = [
  { value: 'a', label: '입론' },
  { value: 'b', label: '반론' },
  { value: 'c', label: '작전 시간' },
];

describe('드롭다운 선택', () => {
  it('위쪽 방향키로 마지막 항목에서 열고 Space로 선택한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu options={OPTIONS} selectedValue="" onSelect={onSelect} />,
    );
    await user.tab();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { name: '작전 시간' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledWith('c');
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('Shift+Tab으로 버튼에 돌아오며 값을 선택하지 않는다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu options={OPTIONS} selectedValue="a" onSelect={onSelect} />,
    );
    const button = screen.getByRole('button');
    await user.click(button);
    await user.tab({ shift: true });
    expect(button).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('방향키로 이동하고 선택해야 값을 전달하며 버튼으로 포커스를 돌린다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu options={OPTIONS} selectedValue="a" onSelect={onSelect} />,
    );
    const button = screen.getByRole('button');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: '입론' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{End}{Home}{ArrowDown}');
    expect(screen.getByRole('option', { name: '반론' })).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('b');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('Escape는 취소하고 Tab은 다음 입력으로 이동한다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <>
        <DropdownMenu options={OPTIONS} selectedValue="b" onSelect={onSelect} />
        <input aria-label="다음 입력" />
      </>,
    );
    const button = screen.getByRole('button');
    await user.click(button);
    expect(screen.getByRole('option', { name: '반론' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(button).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
    await user.keyboard(' ');
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('외부 클릭으로 닫고 비활성 또는 빈 목록은 열지 않는다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(
      <>
        <DropdownMenu options={OPTIONS} selectedValue="a" onSelect={onSelect} />
        <button>외부</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: '입론' }));
    await user.click(screen.getByRole('button', { name: '외부' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(
      <DropdownMenu
        options={OPTIONS}
        selectedValue="a"
        onSelect={onSelect}
        disabled
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    rerender(
      <DropdownMenu options={[]} selectedValue="a" onSelect={onSelect} />,
    );
    await user.click(screen.getByRole('button'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
