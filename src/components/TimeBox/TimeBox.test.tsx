import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import TimeBox from './TimeBox';
import { TimeBoxInfo } from '../../types/type';

afterEach(cleanup);

const PROS_INFO: TimeBoxInfo = {
  stance: 'PROS',
  speechType: '입론',
  boxType: 'NORMAL',
  time: 120,
  timePerTeam: null,
  timePerSpeaking: null,
  speaker: '1번',
  bell: [],
};

const TIME_BASED_INFO: TimeBoxInfo = {
  stance: 'NEUTRAL',
  speechType: '자유토론',
  boxType: 'TIME_BASED',
  time: null,
  timePerTeam: 180,
  timePerSpeaking: 60,
  speaker: null,
  bell: [],
};

describe('타임박스 컴포넌트', () => {
  it('찬성 타임박스의 발언 유형, 화자, 시간을 렌더링하고 루트 속성을 전달한다', () => {
    render(
      <TimeBox
        info={PROS_INFO}
        data-testid="timebox-root"
        className="custom-class"
      />,
    );
    const root = screen.getByTestId('timebox-root');
    expect(root).toHaveClass('justify-start', 'custom-class');
    const titleLabel = screen.getByText(/입론/);
    expect(titleLabel).toBeInTheDocument();
    expect(titleLabel.closest('p')).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
    );
    expect(screen.getByText(/1번 토론자/)).toBeInTheDocument();
    const timeText = screen.getByText('2분 0초');
    expect(timeText).toBeInTheDocument();
    const timeIcon = timeText.closest('p')?.querySelector('svg');
    expect(timeIcon).not.toBeNull();
    expect(timeIcon).toHaveAttribute('aria-hidden', 'true');
    expect(root.querySelector('span p')).toBeNull();
  });

  it('자유토론 타임박스는 팀당·발언당 시간을 함께 표시한다', () => {
    render(<TimeBox info={TIME_BASED_INFO} />);
    expect(screen.getByText('자유토론')).toBeInTheDocument();
    expect(
      screen.getByText('팀당 3분 0초 | 발언당 1분 0초'),
    ).toBeInTheDocument();
  });

  it('actions와 드래그 핸들을 전달하면 표시하고 드래그 아이콘을 보조기기에서 숨긴다', () => {
    const onDragPointerDown = vi.fn();
    render(
      <TimeBox
        info={PROS_INFO}
        actions={<button type="button">편집</button>}
        onDragPointerDown={onDragPointerDown}
      />,
    );
    expect(screen.getByRole('button', { name: '편집' })).toBeInTheDocument();
    const dragHandle = screen.getByTitle('위/아래로 드래그');
    const dragIcon = dragHandle.querySelector('svg');
    expect(dragIcon).toHaveAttribute('aria-hidden', 'true');
    expect(dragHandle).not.toHaveClass('absolute');
    expect(dragHandle).toHaveClass('touch-none');
    fireEvent.pointerDown(dragHandle, { pointerType: 'touch' });
    expect(onDragPointerDown).toHaveBeenCalledTimes(1);
  });

  it('중립 작전시간 타임박스는 신형 중립 색상 토큰과 반응형 폭을 사용한다', () => {
    render(
      <TimeBox
        info={{
          stance: 'NEUTRAL',
          speechType: '작전시간',
          boxType: 'NORMAL',
          time: 90,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: null,
          bell: [],
        }}
        data-testid="neutral-timebox"
      />,
    );
    const root = screen.getByTestId('neutral-timebox');
    const panel = root.firstElementChild;
    expect(root).toHaveClass('justify-center');
    expect(panel).toHaveClass('bg-neutral-100', 'border-neutral-200');
  });
});
