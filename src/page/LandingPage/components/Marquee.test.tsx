import { render, screen } from '@testing-library/react';
import Marquee from './Marquee';

describe('흐르는 목록', () => {
  it('내용을 한 번만 보조 기술과 키보드 이동에 노출한다', () => {
    render(
      <Marquee label="사용 조직">
        <a href="#a">항목</a>
      </Marquee>,
    );

    expect(screen.getAllByRole('link', { name: '항목' })).toHaveLength(1);
    expect(screen.getAllByText('항목')).toHaveLength(2);
    expect(screen.getAllByText('항목')[1].closest('[inert]')).not.toBeNull();
  });

  it('내용이 영역보다 짧으면 빈틈이 없도록 반복해 채운다', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private callback: () => void) {}
        observe() {
          this.callback();
        }
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.getAttribute('role') === 'region' ? 1000 : 0;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);

    render(
      <Marquee label="사용 조직">
        <a href="#a">항목</a>
      </Marquee>,
    );

    // 한 묶음이 1000px 영역을 덮도록 4번 반복하고, 이어 붙일 묶음까지 총 8개
    expect(screen.getAllByText('항목')).toHaveLength(8);
    expect(screen.getAllByRole('link', { name: '항목' })).toHaveLength(1);

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('목록 길이와 관계없이 같은 속도로 흐르도록 한 바퀴 시간을 정한다', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private callback: () => void) {}
        observe() {
          this.callback();
        }
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(0);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(2000);

    render(
      <Marquee label="사용 조직">
        <span>항목</span>
      </Marquee>,
    );

    const track = screen.getByRole('region').firstElementChild as HTMLElement;
    expect(track.style.animationDuration).toBe('50s');

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('목록 영역에 이름을 붙인다', () => {
    render(
      <Marquee label="사용 조직">
        <span>항목</span>
      </Marquee>,
    );

    expect(
      screen.getByRole('region', { name: '사용 조직' }),
    ).toBeInTheDocument();
  });
});
