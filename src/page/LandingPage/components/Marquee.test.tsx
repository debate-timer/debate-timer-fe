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
