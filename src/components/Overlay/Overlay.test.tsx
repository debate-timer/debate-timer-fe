import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Overlay from './Overlay';

describe('공용 오버레이', () => {
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
});
