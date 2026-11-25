import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GeneralHeader from './GeneralHeader';
import HeaderDebateInfo from './HeaderDebateInfo';
import HeaderLoginButton from './HeaderLoginButton';
import AudienceHeader from './AudienceHeader';

afterEach(() => {
  cleanup();
  window.innerWidth = 1024;
});

describe('역할별 헤더', () => {
  it.each([
    ['/', '서비스 소개'],
    ['/?from=header#intro', '서비스 소개'],
    ['/templates', '템플릿'],
    ['/templates?sort=recent#list', '템플릿'],
    ['/dashboard', '대시보드'],
    ['/records', '토론 기록'],
    ['/records?sort=recent#list', '토론 기록'],
    ['/en/records', '토론 기록'],
    ['/templates/1', '대시보드'],
    ['/unknown', '대시보드'],
    ['/en', '서비스 소개'],
    ['/en/', '서비스 소개'],
    ['/en/templates', '템플릿'],
    ['/en/records/1', '대시보드'],
  ])('%s에서는 %s만 선택한다', (path, selectedLabel) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <GeneralHeader isMember canViewRecords onRequireLogin={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { current: 'page' })).toHaveAccessibleName(
      selectedLabel,
    );
  });
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
  it('비회원 탐색은 대시보드 선택 목적지를 로그인에 전달하고 토론 기록 메뉴를 숨긴다', async () => {
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
    await user.click(screen.getByRole('link', { name: '대시보드' }));
    expect(onRequireLogin).toHaveBeenCalledWith('/dashboard');
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(
      expect.arrayContaining(['서비스 소개', '대시보드', '템플릿']),
    );
    expect(
      screen.queryByRole('link', { name: '토론 기록' }),
    ).not.toBeInTheDocument();
  });
  it.each([
    [false, false],
    [false, true],
    [true, false],
  ])(
    '회원(%s)·기록 권한(%s) 조건이 모두 참이 아니면 기록 메뉴를 제공하지 않는다',
    (isMember, canViewRecords) => {
      render(
        <MemoryRouter>
          <GeneralHeader
            isMember={isMember}
            canViewRecords={canViewRecords}
            onRequireLogin={vi.fn()}
          />
        </MemoryRouter>,
      );
      expect(
        screen.queryByRole('link', { name: '토론 기록' }),
      ).not.toBeInTheDocument();
    },
  );
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
  it('헤더 로그인 버튼은 데스크톱 문구와 모바일 아이콘을 함께 제공하고 클릭 시 동작을 실행한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<HeaderLoginButton onClick={onClick} />);
    const button = screen.getByRole('button', { name: '로그인' });
    const text = screen.getByText('로그인');
    const icon = button.querySelector('svg');
    expect(text).toHaveClass('hidden', 'md:inline');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveClass('md:hidden');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('문의 버튼을 누르면 Overlay로 외부 링크를 열고 Escape로 닫는다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <GeneralHeader
          isMember
          canViewRecords
          onRequireLogin={vi.fn()}
          inquiries={[{ label: '일반 문의', url: 'https://example.com' }]}
        />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole('button', { name: '문의' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const link = screen.getByRole('link', { name: '일반 문의' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).not.toHaveClass('underline');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: '일반 문의' }),
      ).not.toBeInTheDocument(),
    );
  });
});

describe('모바일 일반 헤더 햄버거 메뉴', () => {
  const SAMPLE_INQUIRIES = [
    { label: '일반 문의', url: 'https://example.com/general' },
    { label: '템플릿 추가 요청', url: 'https://example.com/template' },
    { label: '단체/제휴 문의', url: 'https://example.com/partnership' },
  ];

  it('모바일에서는 일반 헤더 브랜드 문구와 인라인 탐색을 숨기고 햄버거 메뉴 버튼을 표시한다', () => {
    window.innerWidth = 375;
    render(
      <MemoryRouter>
        <GeneralHeader
          isMember
          canViewRecords
          onRequireLogin={vi.fn()}
          inquiries={SAMPLE_INQUIRIES}
        />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button', { name: '메뉴' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.queryByRole('navigation', { name: '주요 탐색' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '문의' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Debate Timer')).toHaveClass('hidden', 'md:inline');
  });

  it('모바일 청중 헤더에서는 브랜드 문구를 계속 표시한다', () => {
    window.innerWidth = 375;
    render(
      <MemoryRouter>
        <AudienceHeader />
      </MemoryRouter>,
    );

    expect(screen.getByText('Debate Timer')).not.toHaveClass('hidden');
  });

  it('햄버거 버튼을 누르면 왼쪽 방향 Overlay 안에 탐색 링크와 문의 3종을 함께 표시한다', async () => {
    window.innerWidth = 375;
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/templates']}>
        <GeneralHeader
          isMember
          canViewRecords
          onRequireLogin={vi.fn()}
          inquiries={SAMPLE_INQUIRIES}
        />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button', { name: '메뉴' });
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const panel = document.getElementById(
      menuButton.getAttribute('aria-controls')!,
    );
    expect(panel).not.toBeNull();
    expect(panel?.style.transform).toMatch(/^translateX\(\d/);
    await waitFor(() =>
      expect(panel).toHaveStyle({ opacity: '1', transform: 'none' }),
    );

    const nav = within(panel!).getByRole('navigation', { name: '주요 탐색' });
    expect(
      within(nav).getByRole('link', { current: 'page' }),
    ).toHaveAccessibleName('템플릿');
    expect(
      within(nav).getByRole('link', { name: '토론 기록' }),
    ).toBeInTheDocument();

    expect(within(panel!).getByText('문의')).toBeInTheDocument();
    expect(
      within(panel!).queryByRole('button', { name: '문의' }),
    ).not.toBeInTheDocument();
    for (const item of SAMPLE_INQUIRIES) {
      const link = within(panel!).getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('문의 항목이 비어 있으면 모바일 메뉴에 문의 영역을 표시하지 않는다', async () => {
    window.innerWidth = 375;
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <GeneralHeader
          isMember={false}
          canViewRecords={false}
          onRequireLogin={vi.fn()}
          inquiries={[]}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '메뉴' }));
    expect(
      screen.getByRole('navigation', { name: '주요 탐색' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('문의')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '토론 기록' }),
    ).not.toBeInTheDocument();
  });

  it('모바일 메뉴에서 비회원 대시보드를 누르면 로그인을 요청하고 메뉴를 닫는다', async () => {
    window.innerWidth = 375;
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

    const menuButton = screen.getByRole('button', { name: '메뉴' });
    await user.click(menuButton);
    await user.click(screen.getByRole('link', { name: '대시보드' }));

    expect(onRequireLogin).toHaveBeenCalledWith('/dashboard');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(
        screen.queryByRole('navigation', { name: '주요 탐색' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('Escape·바깥 클릭·데스크톱 전환 시 모바일 메뉴를 닫는다', async () => {
    window.innerWidth = 375;
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <div>
          <GeneralHeader
            isMember
            canViewRecords={false}
            onRequireLogin={vi.fn()}
            inquiries={SAMPLE_INQUIRIES}
          />
          <button type="button">외부 영역</button>
        </div>
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button', { name: '메뉴' });
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
    await waitFor(() =>
      expect(
        screen.queryByRole('navigation', { name: '주요 탐색' }),
      ).not.toBeInTheDocument(),
    );

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: '외부 영역' }));
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);
    act(() => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));
    });

    expect(
      screen.queryByRole('button', { name: '메뉴' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: '주요 탐색' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '문의' })).toBeInTheDocument();
  });
});
