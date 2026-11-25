import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Overlay from './Overlay';

describe('공용 오버레이', () => {
  it('최소 너비를 보존하고 화면보다 클 때만 줄였다가 화면 확장 시 복원한다', () => {
    render(
      <Overlay aria-label="언어 목록" style={{ minWidth: 112 }}>
        KR EN
      </Overlay>,
    );
    const panel = screen.getByLabelText('언어 목록');
    expect(panel.style.minWidth).toBe('112px');
    const width = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(120);
    fireEvent.resize(window);
    expect(panel.style.minWidth).toBe('88px');
    width.mockReturnValue(1024);
    fireEvent.resize(window);
    expect(panel.style.minWidth).toBe('112px');
    width.mockRestore();
  });
  it('화면 오른쪽을 넘으면 16px 여백 안으로 보정하고 resize 때 다시 계산한다', () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        left: 950,
        right: 1150,
        top: 40,
        bottom: 140,
        width: 200,
        height: 100,
        x: 950,
        y: 40,
        toJSON: () => ({}),
      });
    render(<Overlay aria-label="경계 패널">내용</Overlay>);
    expect(screen.getByLabelText('경계 패널').style.translate).toBe(
      '-142px 0px',
    );
    rect.mockReturnValue({
      left: -122,
      right: 78,
      top: 40,
      bottom: 140,
      width: 200,
      height: 100,
      x: -122,
      y: 40,
      toJSON: () => ({}),
    });
    fireEvent.resize(window);
    expect(screen.getByLabelText('경계 패널').style.translate).toBe('0px 0px');
    rect.mockRestore();
  });
  it('기본 방향은 애니메이션 없이 열리고 닫힌다', async () => {
    const { rerender } = render(
      <Overlay isOpen aria-label="패널">
        내용
      </Overlay>,
    );
    expect(screen.getByLabelText('패널')).toHaveStyle({
      opacity: '1',
      transform: 'none',
    });
    rerender(
      <Overlay isOpen={false} aria-label="패널">
        내용
      </Overlay>,
    );
    await waitFor(() =>
      expect(screen.queryByLabelText('패널')).not.toBeInTheDocument(),
    );
  });
  it.each([
    ['up', 'translateY(8px)'],
    ['down', 'translateY(-8px)'],
    ['left', 'translateX(8px)'],
    ['right', 'translateX(-8px)'],
  ] as const)(
    '%s 목적지의 반대쪽에서 시작해 제자리로 등장한다',
    async (direction, transform) => {
      const { rerender } = render(
        <Overlay direction={direction} aria-label="패널">
          내용
        </Overlay>,
      );
      const panel = screen.getByLabelText('패널');
      expect(panel).toHaveStyle({ opacity: '0', transform });
      await waitFor(() =>
        expect(panel).toHaveStyle({ opacity: '1', transform: 'none' }),
      );
      rerender(
        <Overlay isOpen={false} direction={direction} aria-label="패널">
          내용
        </Overlay>,
      );
      expect(panel).toBeInTheDocument();
      await waitFor(() =>
        expect(panel).toHaveStyle({ opacity: '0', transform }),
      );
      await waitFor(() =>
        expect(screen.queryByLabelText('패널')).not.toBeInTheDocument(),
      );
    },
  );

  it('내용과 HTML 속성을 전달하며 내부 조작을 유지한다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Overlay id="settings-panel" aria-label="설정 패널">
        <button onClick={handleClick}>적용</button>
      </Overlay>,
    );
    expect(screen.getByLabelText('설정 패널')).toHaveAttribute(
      'id',
      'settings-panel',
    );
    await user.click(screen.getByRole('button', { name: '적용' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('바깥 둥근 모서리 클리핑을 유지하고 내부 스크롤 영역에서 내용을 스크롤한다', () => {
    render(
      <Overlay
        aria-label="스크롤 패널"
        contentClassName="space-y-2 p-3!"
        style={{ maxHeight: 200 }}
      >
        <div>첫 번째 항목</div>
      </Overlay>,
    );

    const outer = screen.getByLabelText('스크롤 패널');
    expect(outer).toHaveClass('overflow-hidden', 'rounded-xl');
    expect(outer.style.overflow).not.toBe('auto');

    const inner = screen.getByText('첫 번째 항목').parentElement;
    expect(inner).not.toBe(outer);
    expect(inner).toHaveClass('overflow-auto', 'space-y-2', 'p-3!');
  });
});
