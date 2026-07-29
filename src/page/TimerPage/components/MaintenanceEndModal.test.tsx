import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GlobalPortal } from '../../../util/GlobalPortal';
import { useModal } from '../../../hooks/useModal';
import { setSessionCustomizeTableData } from '../../../util/sessionStorage';
import { SAMPLE_TABLE_DATA } from '../../../constants/sample_table';
import MaintenanceEndModal from './MaintenanceEndModal';

function TestTimer() {
  const [timerState, setTimerState] = useState(0);
  const { openModal, closeModal, ModalWrapper } = useModal();

  return (
    <>
      <p>타이머 상태 {timerState}</p>
      <button onClick={() => setTimerState((value) => value + 1)}>
        타이머 변경
      </button>
      <button onClick={openModal}>종료 모달 열기</button>
      <MaintenanceEndModal Wrapper={ModalWrapper} onClose={closeModal} />
    </>
  );
}

async function renderMaintenanceEndModal() {
  const i18n = createInstance();
  await i18n.init({
    lng: 'ko',
    resources: {
      ko: {
        translation: {
          '토론이 끝났습니다. 종료하시겠습니까?':
            '토론이 끝났습니다. 종료하시겠습니까?',
          예: '예',
          아니오: '아니오',
          '모달 닫기': '모달 닫기',
        },
      },
    },
  });

  return render(
    <I18nextProvider i18n={i18n}>
      <GlobalPortal.Provider>
        <MemoryRouter initialEntries={['/table/customize/guest']}>
          <Routes>
            <Route path="/table/customize/guest" element={<TestTimer />} />
            <Route
              path="/overview/customize/guest"
              element={<div>게스트 개요</div>}
            />
            <Route path="/home" element={<div>점검 홈</div>} />
          </Routes>
        </MemoryRouter>
      </GlobalPortal.Provider>
    </I18nextProvider>,
  );
}

describe('점검 중 타이머 종료 모달', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setSessionCustomizeTableData(SAMPLE_TABLE_DATA);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('아니오를 누르면 게스트 세션을 유지하고 개요로 이동한다', async () => {
    const user = userEvent.setup();
    await renderMaintenanceEndModal();
    await user.click(screen.getByRole('button', { name: '종료 모달 열기' }));

    await user.click(screen.getByRole('button', { name: '아니오' }));

    expect(await screen.findByText('게스트 개요')).toBeInTheDocument();
    expect(sessionStorage.getItem('DebateTableData')).not.toBeNull();
  });

  test('예를 누르면 게스트 세션을 유지하고 점검 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    await renderMaintenanceEndModal();
    await user.click(screen.getByRole('button', { name: '종료 모달 열기' }));

    await user.click(screen.getByRole('button', { name: '예' }));

    expect(await screen.findByText('점검 홈')).toBeInTheDocument();
    expect(sessionStorage.getItem('DebateTableData')).not.toBeNull();
  });

  test.each(['close-button', 'overlay', 'escape'] as const)(
    '%s 닫기는 현재 타이머 상태를 유지한다',
    async (closeType) => {
      const user = userEvent.setup();
      await renderMaintenanceEndModal();
      await user.click(screen.getByRole('button', { name: '타이머 변경' }));
      await user.click(screen.getByRole('button', { name: '종료 모달 열기' }));

      if (closeType === 'close-button') {
        await user.click(screen.getByRole('button', { name: '모달 닫기' }));
      } else if (closeType === 'overlay') {
        const overlay = screen.getByRole('dialog').parentElement?.parentElement;
        expect(overlay).toBeTruthy();
        if (!overlay) throw new Error('모달 바깥 영역을 찾지 못했습니다.');
        await user.click(overlay);
      } else {
        await user.keyboard('{Escape}');
      }

      expect(screen.getByText('타이머 상태 1')).toBeInTheDocument();
      expect(
        screen.queryByText('토론이 끝났습니다. 종료하시겠습니까?'),
      ).not.toBeInTheDocument();
    },
  );
});
