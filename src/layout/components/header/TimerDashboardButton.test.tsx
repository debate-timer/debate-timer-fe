import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GlobalPortal } from '../../../util/GlobalPortal';
import TimerDashboardButton from './TimerDashboardButton';

function renderHeader(path = '/timer') {
  return render(
    <GlobalPortal.Provider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:lang?/timer" element={<TimerDashboardButton />} />
          <Route path="/dashboard" element={<p>한국어 대시보드</p>} />
          <Route path="/en/dashboard" element={<p>영어 대시보드</p>} />
        </Routes>
      </MemoryRouter>
    </GlobalPortal.Provider>,
  );
}

describe('타이머 헤더의 대시보드 이동', () => {
  it('취소와 Escape는 이동하지 않고 버튼으로 포커스를 돌려준다', async () => {
    const user = userEvent.setup();
    renderHeader();
    const trigger = screen.getByRole('button', { name: '대시보드' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', {
      name: '토론이 진행 중입니다. 이탈하시겠습니까?',
    });
    const cancel = within(dialog).getByRole('button', { name: '취소' });
    expect(cancel).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: '확인' })).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.click(cancel);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it.each([
    ['/timer', '한국어 대시보드'],
    ['/en/timer', '영어 대시보드'],
  ])(
    '확인한 경우에만 %s의 언어를 유지해 이동한다',
    async (path, destination) => {
      const user = userEvent.setup();
      renderHeader(path);
      await user.click(screen.getByRole('button', { name: '대시보드' }));
      expect(screen.queryByText(destination)).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(screen.getByText(destination)).toBeInTheDocument();
    },
  );
});
