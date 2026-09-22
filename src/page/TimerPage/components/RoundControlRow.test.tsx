import { act, fireEvent, render, screen } from '@testing-library/react';
import RoundControlRow, { ROUND_CONTROL_COOLDOWN_MS } from './RoundControlRow';
import { TimeBoxInfo } from '../../../type/type';

function createTimeBox(): TimeBoxInfo {
  return {
    stance: 'PROS',
    speechType: '입론',
    bell: null,
    boxType: 'NORMAL',
    time: 60,
    timePerTeam: null,
    timePerSpeaking: null,
    speaker: null,
  };
}

const table = [createTimeBox(), createTimeBox(), createTimeBox()];

describe('RoundControlRow', () => {
  const setup = (index: number) => {
    const onEvent = vi.fn();
    const props = {
      table,
      goToOtherItem: vi.fn(),
      openDoneModal: vi.fn(),
      onEvent,
    };
    const view = render(<RoundControlRow {...props} index={index} />);
    const moveTo = (nextIndex: number) =>
      view.rerender(<RoundControlRow {...props} index={nextIndex} />);

    return { onEvent, moveTo };
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('다음 차례 버튼을 연타해도 이동 이벤트는 한 번만 발생한다', () => {
    const { onEvent, moveTo } = setup(0);

    fireEvent.click(screen.getByText('다음 차례'));
    moveTo(1);
    fireEvent.click(screen.getByText('다음 차례'));

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(expect.any(Function), 'NEXT');
  });

  it('마지막 직전 차례에서 다음 차례를 더블클릭해도 같은 자리의 토론 종료가 발생하지 않는다', () => {
    const { onEvent, moveTo } = setup(1);

    fireEvent.click(screen.getByText('다음 차례'));
    moveTo(2);
    fireEvent.click(screen.getByText('토론 종료'));

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).not.toHaveBeenCalledWith(expect.any(Function), 'FINISHED');
  });

  it('대기 시간이 지나면 다시 조작할 수 있다', () => {
    const { onEvent, moveTo } = setup(1);

    fireEvent.click(screen.getByText('다음 차례'));
    moveTo(2);
    act(() => {
      vi.advanceTimersByTime(ROUND_CONTROL_COOLDOWN_MS);
    });
    fireEvent.click(screen.getByText('토론 종료'));

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenLastCalledWith(expect.any(Function), 'FINISHED');
  });

  it('이전 차례 버튼도 연타를 막는다', () => {
    const { onEvent, moveTo } = setup(2);

    fireEvent.click(screen.getByText('이전 차례'));
    moveTo(1);
    fireEvent.click(screen.getByText('이전 차례'));

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(expect.any(Function), 'BEFORE');
  });
});
