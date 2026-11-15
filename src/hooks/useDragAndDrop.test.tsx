import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import useDragAndDrop from './useDragAndDrop';

afterEach(cleanup);

function TestList() {
  const [items, setItems] = useState(['A', 'B', 'C']);
  const { handlePointerDown, DragAndDropWrapper } = useDragAndDrop({
    data: items,
    setData: setItems,
    throttleDelay: 0,
  });

  return (
    <DragAndDropWrapper>
      {items.map((item, index) => (
        <div key={item} data-testid="drag-item">
          <span>{item}</span>
          <button
            type="button"
            onPointerDown={(event) => handlePointerDown(index, event.pointerId)}
          >
            drag-{item}
          </button>
        </div>
      ))}
    </DragAndDropWrapper>
  );
}

describe('드래그 앤 드롭 훅', () => {
  it('포인터(마우스·터치) 드래그로 항목 순서를 변경한다', () => {
    render(<TestList />);
    const wrapper = screen.getByText('drag-A').closest('div')!
      .parentElement as HTMLDivElement;
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 300,
      height: 300,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.pointerDown(screen.getByRole('button', { name: 'drag-A' }), {
      pointerType: 'touch',
    });
    fireEvent(
      wrapper,
      new MouseEvent('pointermove', { bubbles: true, clientY: 250 }),
    );
    fireEvent.pointerUp(wrapper, { pointerType: 'touch' });

    const labels = screen
      .getAllByTestId('drag-item')
      .map((el) => el.querySelector('span')?.textContent);
    expect(labels).toEqual(['B', 'C', 'A']);
  });

  it('포인터가 취소되면 순서를 변경하지 않고 드래그 상태를 초기화한다', () => {
    render(<TestList />);
    const wrapper = screen.getByText('drag-A').closest('div')!
      .parentElement as HTMLDivElement;
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 300,
      height: 300,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.pointerDown(screen.getByRole('button', { name: 'drag-A' }), {
      pointerType: 'touch',
    });
    fireEvent.pointerMove(wrapper, { clientY: 250, pointerType: 'touch' });
    fireEvent.pointerCancel(wrapper, { pointerType: 'touch' });

    const labels = screen
      .getAllByTestId('drag-item')
      .map((el) => el.querySelector('span')?.textContent);
    expect(labels).toEqual(['A', 'B', 'C']);
  });

  it('활성 포인터가 드래그 중일 때 다른 pointerId의 이동·종료 이벤트는 무시한다', () => {
    render(<TestList />);
    const wrapper = screen.getByText('drag-A').closest('div')!
      .parentElement as HTMLDivElement;
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 300,
      height: 300,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.pointerDown(screen.getByRole('button', { name: 'drag-A' }), {
      pointerType: 'touch',
      pointerId: 1,
    });
    fireEvent.pointerMove(wrapper, {
      clientY: 250,
      pointerType: 'touch',
      pointerId: 2,
    });
    fireEvent.pointerUp(wrapper, {
      pointerType: 'touch',
      pointerId: 2,
    });

    fireEvent.pointerMove(wrapper, {
      clientY: 150,
      pointerType: 'touch',
      pointerId: 1,
    });
    fireEvent.pointerUp(wrapper, {
      pointerType: 'touch',
      pointerId: 1,
    });

    const labels = screen
      .getAllByTestId('drag-item')
      .map((el) => el.querySelector('span')?.textContent);
    expect(labels).toEqual(['B', 'A', 'C']);
  });
});
