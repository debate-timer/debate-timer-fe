import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CustomRangeSlider from './CustomRangeSlider';
import { useState } from 'react';

afterEach(cleanup);

describe('범위 슬라이더 컴포넌트', () => {
  it('손가락 이동을 값에 반영하고 영역 밖에서 놓아도 범위 끝에서 한 번만 커밋한다', () => {
    const onCommit = vi.fn();
    function Harness() {
      const [value, setValue] = useState(2);
      return (
        <CustomRangeSlider
          value={value}
          min={0}
          max={10}
          onValueChange={setValue}
          onValueCommit={onCommit}
        />
      );
    }
    render(<Harness />);
    const slider = screen.getByRole('slider');
    const capture = vi.fn();
    Object.defineProperty(slider, 'setPointerCapture', { value: capture });
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      width: 100,
    } as DOMRect);
    fireEvent.pointerDown(slider, {
      pointerType: 'touch',
      isPrimary: true,
      pointerId: 1,
      clientX: 30,
    });
    fireEvent.pointerMove(slider, {
      pointerType: 'touch',
      isPrimary: true,
      pointerId: 1,
      clientX: 90,
    });
    expect(slider).toHaveValue('8');
    expect(capture).toHaveBeenCalledWith(1);
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.pointerUp(slider, {
      pointerType: 'touch',
      isPrimary: true,
      pointerId: 1,
      clientX: 130,
    });
    expect(slider).toHaveValue('10');
    fireEvent.blur(slider);
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
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

    fireEvent.pointerDown(slider, { pointerType: 'touch', isPrimary: true });
    fireEvent.change(slider, { target: { value: '8' } });
    fireEvent.pointerUp(slider, { pointerType: 'touch', isPrimary: true });
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

    fireEvent.pointerDown(slider, { pointerType: 'touch', isPrimary: true });
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '7' } });
    fireEvent.pointerCancel(slider, { pointerType: 'touch', isPrimary: true });

    expect(onValueCommit).toHaveBeenCalledTimes(1);
    fireEvent.blur(slider);
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('마우스 드래그 중 슬라이더 밖에서 포커스가 해제되면 수치 말풍선을 닫는다', () => {
    render(
      <CustomRangeSlider
        value={5}
        min={0}
        max={10}
        ariaLabel="음량"
        onValueChange={vi.fn()}
      />,
    );
    const slider = screen.getByRole('slider', { name: '음량' });

    fireEvent.pointerDown(slider, {
      pointerType: 'mouse',
      isPrimary: true,
      pointerId: 1,
    });
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.mouseLeave(slider);
    fireEvent.blur(slider);

    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('터치 드래그에서 0..0.3, step=0.1의 마지막 유효 값 0.3까지 선택할 수 있다', () => {
    function Harness() {
      const [value, setValue] = useState(0);
      return (
        <CustomRangeSlider
          value={value}
          min={0}
          max={0.3}
          step={0.1}
          onValueChange={setValue}
        />
      );
    }
    render(<Harness />);
    const slider = screen.getByRole('slider');
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
    } as DOMRect);

    fireEvent.pointerDown(slider, {
      pointerType: 'touch',
      isPrimary: true,
      pointerId: 1,
      clientX: 100,
    });

    expect(slider).toHaveValue('0.3');
  });

  it('터치 드래그에서 0..10, step=4의 최대값은 8로 제한된다', () => {
    function Harness() {
      const [value, setValue] = useState(0);
      return (
        <CustomRangeSlider
          value={value}
          min={0}
          max={10}
          step={4}
          onValueChange={setValue}
        />
      );
    }
    render(<Harness />);
    const slider = screen.getByRole('slider');
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
    } as DOMRect);

    fireEvent.pointerDown(slider, {
      pointerType: 'touch',
      isPrimary: true,
      pointerId: 1,
      clientX: 100,
    });

    expect(slider).toHaveValue('8');
  });
});
