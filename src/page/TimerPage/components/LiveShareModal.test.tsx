import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { vi } from 'vitest';
import LiveShareModal from './LiveShareModal';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg aria-label="qr-code" data-value={value} />
  ),
}));

vi.mock('../../../components/LoadingSpinner', () => ({
  default: () => <div role="status">loading</div>,
}));

type LiveShareModalProps = ComponentProps<typeof LiveShareModal>;

const SHARE_URL = 'https://example.com/live/1';
const SUCCESS_TITLE = '토론 타이머 화면 공유';
const ERROR_TITLE = '라이브 공유 불가';
const TOKEN_ERROR_MESSAGE = '사회자 인증 토큰 발급에 실패했어요...';
const LIVE_SERVER_ERROR_MESSAGE = '라이브 서버 연결에 실패했어요...';
const CLOSE_LABEL = '모달 닫기';
const COPY_LINK_LABEL = '링크 공유';
const COPIED_LABEL = '링크 복사됨';
const COPY_FAILED_LABEL = '링크 복사 실패';
const QR_DESCRIPTION =
  '휴대폰 카메라로 QR 코드를 스캔하면 토론 타이머 화면이 자동으로 열립니다.';

function renderLiveShareModal(overrides: Partial<LiveShareModalProps> = {}) {
  const props: LiveShareModalProps = {
    shareUrl: SHARE_URL,
    isLoading: false,
    isError: false,
    errorType: 'else',
    toggleModal: vi.fn(),
    ...overrides,
  };

  render(<LiveShareModal {...props} />);

  return props;
}

describe('LiveShareModal', () => {
  test('로딩 상태에서 스피너를 보여준다', () => {
    renderLiveShareModal({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('loading');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('qr-code')).not.toBeInTheDocument();
  });

  test('성공 상태에서 공유 제목과 QR 코드를 보여준다', () => {
    renderLiveShareModal();

    expect(
      screen.getByRole('heading', { name: SUCCESS_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('qr-code')).toHaveAttribute(
      'data-value',
      SHARE_URL,
    );
    expect(screen.getByText(QR_DESCRIPTION)).toBeInTheDocument();
  });

  test('닫기 버튼을 클릭하면 toggleModal을 호출한다', async () => {
    const user = userEvent.setup();
    const toggleModal = vi.fn();

    renderLiveShareModal({ toggleModal });

    await user.click(screen.getByRole('button', { name: CLOSE_LABEL }));

    expect(toggleModal).toHaveBeenCalledTimes(1);
  });

  test('토큰 에러 상태를 보여준다', () => {
    renderLiveShareModal({ isError: true, errorType: 'token' });

    expect(
      screen.getByRole('heading', { name: ERROR_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText(TOKEN_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByLabelText('qr-code')).not.toBeInTheDocument();
  });

  test('라이브 서버 에러 상태를 보여준다', () => {
    renderLiveShareModal({ isError: true, errorType: 'else' });

    expect(
      screen.getByRole('heading', { name: ERROR_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText(LIVE_SERVER_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByLabelText('qr-code')).not.toBeInTheDocument();
  });

  test('다른 곳에서 공유를 시작해 밀려난 상태를 보여준다', () => {
    renderLiveShareModal({ isError: true, errorType: 'replaced' });

    expect(
      screen.getByRole('heading', { name: '다른 곳에서 공유 중' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '다른 탭이나 기기에서 라이브 공유를 시작해서 이 화면의 공유를 멈췄어요.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('qr-code')).not.toBeInTheDocument();
  });

  test('밀려난 상태에서 다시 공유하기 버튼을 클릭하면 onRestart를 호출한다', async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();

    renderLiveShareModal({ isError: true, errorType: 'replaced', onRestart });

    await user.click(
      screen.getByRole('button', { name: '이 화면에서 다시 공유하기' }),
    );

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  test('밀려난 상태가 아닌 오류에서는 다시 공유하기 버튼을 보여주지 않는다', () => {
    renderLiveShareModal({
      isError: true,
      errorType: 'else',
      onRestart: vi.fn(),
    });

    expect(
      screen.queryByRole('button', { name: '이 화면에서 다시 공유하기' }),
    ).not.toBeInTheDocument();
  });

  test('연결이 끊긴 오류에서는 새로고침 안내를 보여준다', () => {
    renderLiveShareModal({ isError: true, errorType: 'disconnected' });

    expect(screen.getByText('라이브 연결 끊김')).toBeInTheDocument();
    expect(
      screen.getByText('라이브 서버와 연결이 끊겼어요. 새로고침 해주세요.'),
    ).toBeInTheDocument();
  });

  test('링크 공유 버튼을 클릭하면 QR 코드와 같은 URL을 클립보드에 복사한다', async () => {
    const user = userEvent.setup();

    renderLiveShareModal();

    await user.click(screen.getByRole('button', { name: COPY_LINK_LABEL }));

    expect(screen.getByLabelText('qr-code')).toHaveAttribute(
      'data-value',
      SHARE_URL,
    );
    await expect(navigator.clipboard.readText()).resolves.toBe(SHARE_URL);
    expect(
      screen.getByRole('button', { name: COPIED_LABEL }),
    ).toBeInTheDocument();
  });

  test('복사 완료 표시는 잠시 후 원래 버튼 문구로 돌아간다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    try {
      renderLiveShareModal();

      await user.click(screen.getByRole('button', { name: COPY_LINK_LABEL }));
      expect(
        screen.getByRole('button', { name: COPIED_LABEL }),
      ).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(
        screen.getByRole('button', { name: COPY_LINK_LABEL }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  test('클립보드 복사에 실패하면 실패 문구를 보여준다', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied'),
    );
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    renderLiveShareModal();

    await user.click(screen.getByRole('button', { name: COPY_LINK_LABEL }));

    expect(
      screen.getByRole('button', { name: COPY_FAILED_LABEL }),
    ).toBeInTheDocument();
  });

  test('오류 상태에서는 링크 공유 버튼을 보여주지 않는다', () => {
    renderLiveShareModal({ isError: true, errorType: 'else' });

    expect(
      screen.queryByRole('button', { name: COPY_LINK_LABEL }),
    ).not.toBeInTheDocument();
  });
});
