import { act, render, screen } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import useTranscriptLeaveGuard from './useTranscriptLeaveGuard';

const TABLE_ID = 1;
const TIMER_PATH = `/table/customize/${TABLE_ID}`;

let navigateFromTimer: (path: string) => void = () => {};
let guard: ReturnType<typeof useTranscriptLeaveGuard>;

function GuardedTimer({ isRecording }: { isRecording: boolean }) {
  guard = useTranscriptLeaveGuard({ tableId: TABLE_ID, isRecording });
  const navigate = useNavigate();
  navigateFromTimer = (path) => {
    navigate(path);
  };
  return <p>타이머 화면</p>;
}

function renderGuard(isRecording: boolean) {
  const router = createMemoryRouter(
    [
      { path: TIMER_PATH, element: <GuardedTimer isRecording={isRecording} /> },
      { path: '/en/table/customize/:id', element: <p>영어 타이머 화면</p> },
      { path: `${TIMER_PATH}/end`, element: <p>토론 종료 화면</p> },
      { path: `/en${TIMER_PATH}/end`, element: <p>영어 토론 종료 화면</p> },
      { path: '/', element: <p>대시보드</p> },
    ],
    { initialEntries: ['/', TIMER_PATH], initialIndex: 1 },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('토론 기록 이탈 방지 훅(useTranscriptLeaveGuard)은', () => {
  describe('토론 기록 중일 때', () => {
    it('다른 화면으로 이동하면 이동을 막고 안내창을 연다', async () => {
      renderGuard(true);

      await act(async () => {
        navigateFromTimer('/');
      });

      expect(screen.getByText('타이머 화면')).toBeInTheDocument();
      expect(guard.isLeaveModalOpen).toBe(true);
    });

    it('뒤로 가기를 해도 이동을 막고 안내창을 연다', async () => {
      const router = renderGuard(true);

      await act(async () => {
        await router.navigate(-1);
      });

      expect(screen.getByText('타이머 화면')).toBeInTheDocument();
      expect(guard.isLeaveModalOpen).toBe(true);
    });

    it('언어를 바꿔 같은 화면의 다른 경로로 이동해도 안내창을 연다', async () => {
      renderGuard(true);

      await act(async () => {
        navigateFromTimer(`/en${TIMER_PATH}`);
      });

      expect(guard.isLeaveModalOpen).toBe(true);
    });

    it('확인하면 막았던 화면으로 이동한다', async () => {
      renderGuard(true);
      await act(async () => {
        navigateFromTimer('/');
      });

      await act(async () => {
        guard.confirmLeave();
      });

      expect(screen.getByText('대시보드')).toBeInTheDocument();
    });

    it('취소하면 현재 화면에 머물고 안내창을 닫는다', async () => {
      renderGuard(true);
      await act(async () => {
        navigateFromTimer('/');
      });

      await act(async () => {
        guard.cancelLeave();
      });

      expect(screen.getByText('타이머 화면')).toBeInTheDocument();
      expect(guard.isLeaveModalOpen).toBe(false);
    });

    it.each([`${TIMER_PATH}/end`, `/en${TIMER_PATH}/end`])(
      '토론 종료 화면(%s)으로는 안내 없이 이동한다',
      async (endPath) => {
        renderGuard(true);

        await act(async () => {
          navigateFromTimer(endPath);
        });

        expect(screen.getByText(/토론 종료 화면/)).toBeInTheDocument();
      },
    );

    it('새로고침·탭 닫기 시 브라우저 이탈 확인을 요청한다', () => {
      renderGuard(true);
      const event = new Event('beforeunload', { cancelable: true });

      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('토론 기록 중이 아닐 때', () => {
    it('안내 없이 바로 이동한다', async () => {
      renderGuard(false);

      await act(async () => {
        navigateFromTimer('/');
      });

      expect(screen.getByText('대시보드')).toBeInTheDocument();
    });

    it('새로고침·탭 닫기 시 브라우저 이탈 확인을 요청하지 않는다', () => {
      renderGuard(false);
      const event = new Event('beforeunload', { cancelable: true });

      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });
});
