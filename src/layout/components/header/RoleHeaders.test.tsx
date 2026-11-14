import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GeneralHeader from './GeneralHeader';
import HeaderDebateInfo from './HeaderDebateInfo';
import AudienceHeader from './AudienceHeader';

afterEach(cleanup);

describe('역할별 헤더', () => {
  it.each([false, true])(
    '회원 여부 %s에서도 공개 템플릿 링크를 제공한다',
    async (isMember) => {
      const onRequireLogin = vi.fn();
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <GeneralHeader
            isMember={isMember}
            canViewRecords={false}
            onRequireLogin={onRequireLogin}
          />
        </MemoryRouter>,
      );
      const link = screen.getByRole('link', { name: '템플릿' });
      expect(link).toHaveAttribute('href', '/templates');
      await user.click(link);
      expect(onRequireLogin).not.toHaveBeenCalled();
    },
  );
  it('비회원 탐색은 선택 목적지를 로그인에 전달한다', async () => {
    const user = userEvent.setup();
    const onRequireLogin = vi.fn();
    render(
      <MemoryRouter>
        <GeneralHeader
          isMember={false}
          canViewRecords={false}
          onRequireLogin={onRequireLogin}
        />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: '토론 기록' }));
    expect(onRequireLogin).toHaveBeenCalledWith('/records');
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(
      expect.arrayContaining(['서비스 소개', '대시보드', '토론 기록']),
    );
  });
  it('권한 없는 회원에게 기록 메뉴를 제공하지 않는다', () => {
    render(
      <MemoryRouter>
        <GeneralHeader
          isMember
          canViewRecords={false}
          onRequireLogin={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole('link', { name: '토론 기록' }),
    ).not.toBeInTheDocument();
  });
  it('긴 정보는 키보드로 펼치고 닫는다', async () => {
    const user = userEvent.setup();
    render(<HeaderDebateInfo name="긴 시간표 이름" agenda="긴 토론 주제" />);
    const trigger = screen.getByRole('button', { name: '토론 정보 펼치기' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('정보가 없어도 청중 헤더와 가능한 조작을 표시한다', () => {
    render(
      <MemoryRouter>
        <AudienceHeader actions={<button aria-label="로그인">로그인</button>} />
      </MemoryRouter>,
    );
    expect(screen.getByText('시간표 이름 없음')).toBeInTheDocument();
    expect(screen.getByText('주제 없음')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '로그아웃' }),
    ).not.toBeInTheDocument();
  });
});
