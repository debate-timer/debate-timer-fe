import { render, screen } from '@testing-library/react';
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
});
