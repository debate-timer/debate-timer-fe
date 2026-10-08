import { render, screen } from '@testing-library/react';
import StickyTriSectionHeader from './StickyTriSectionHeader';

function renderHeader() {
  return render(
    <StickyTriSectionHeader>
      <StickyTriSectionHeader.Left>
        <span>시간표 이름</span>
      </StickyTriSectionHeader.Left>
      <StickyTriSectionHeader.Center>
        <span>토론 주제</span>
      </StickyTriSectionHeader.Center>
    </StickyTriSectionHeader>,
  );
}

describe('StickyTriSectionHeader', () => {
  it('헤더 아래로 펼쳐지는 메뉴가 잘리지 않도록 헤더는 넘치는 영역을 숨기지 않는다', () => {
    renderHeader();

    expect(screen.getByRole('banner')).not.toHaveClass('overflow-hidden');
  });

  it('제목 영역은 넘치는 내용을 헤더 안에서 잘라낸다', () => {
    renderHeader();

    expect(screen.getByText('시간표 이름').parentElement).toHaveClass(
      'overflow-hidden',
    );
    expect(screen.getByText('토론 주제').parentElement).toHaveClass(
      'overflow-hidden',
    );
  });
});
