import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CustomRangeSlider from './CustomRangeSlider';

afterEach(cleanup);

describe('CustomRangeSlider', () => {
  it('범위를 벗어난 value나 min > max 입력을 안전하게 보정한다', () => {
    render(
      <CustomRangeSlider
        value={150}
        min={10}
        max={100}
        step={0}
        onValueChange={vi.fn()}
      />,
    );
    const slider = screen.getByRole('slider', { name: '범위 조절' });
    expect(slider).toHaveValue('100');
    expect(slider).toHaveAttribute('step', '1');
  });

  it('값을 변경한 뒤 pointerUp과 blur가 연달아 발생해도 onValueCommit은 한 번만 호출된다', () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <CustomRangeSlider
        value={5}
        min={0}
        max={10}
        ariaLabel="음량"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    );
    const slider = screen.getByRole('slider', { name: '음량' });

    fireEvent.pointerDown(slider, { pointerType: 'touch' });
    fireEvent.change(slider, { target: { value: '8' } });
    fireEvent.pointerUp(slider, { pointerType: 'touch' });
    fireEvent.blur(slider);

    expect(onValueChange).toHaveBeenCalledWith(8);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
  });

  it('값 변경 없이 포커스 후 blur되면 onValueCommit을 호출하지 않는다', () => {
    const onValueCommit = vi.fn();
    render(
      <CustomRangeSlider
        value={5}
        min={0}
        max={10}
        ariaLabel="음량"
        onValueChange={vi.fn()}
        onValueCommit={onValueCommit}
      />,
    );
    const slider = screen.getByRole('slider', { name: '음량' });

    fireEvent.focus(slider);
    fireEvent.blur(slider);

    expect(onValueCommit).not.toHaveBeenCalled();
  });

  it('터치 드래그 중에는 툴팁을 표시하고 pointerCancel 시 미커밋 변경을 커밋한다', () => {
    const onValueCommit = vi.fn();
    const { container } = render(
      <CustomRangeSlider
        value={5}
        min={0}
        max={10}
        ariaLabel="음량"
        onValueChange={vi.fn()}
        onValueCommit={onValueCommit}
      />,
    );
    const slider = screen.getByRole('slider', { name: '음량' });

    fireEvent.pointerDown(slider, { pointerType: 'touch' });
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '7' } });
    fireEvent.pointerCancel(slider, { pointerType: 'touch' });

    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });
});
