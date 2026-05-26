import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import LiveShareModal from './LiveShareModal';

const useGetChairmanTokenMock = vi.hoisted(() => vi.fn());
const useChairmanSocketMock = vi.hoisted(() => vi.fn());

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg aria-label="qr-code" data-value={value} />
  ),
}));

vi.mock('../../../components/LoadingSpinner/LoadingSpinner', () => ({
  default: () => <div role="status">loading</div>,
}));

vi.mock('../../../hooks/query/useGetChairmanToken', () => ({
  default: useGetChairmanTokenMock,
}));

vi.mock('../../../hooks/sockets/useChairmanSocket', () => ({
  default: useChairmanSocketMock,
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

describe('LiveShareModal', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useChairmanSocketMock.mockReturnValue({
      connect,
      disconnect,
      isConnected: false,
      error: null,
    });
  });

  test('토큰을 불러오는 동안 로딩 상태를 보여준다', () => {
    useGetChairmanTokenMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<LiveShareModal Wrapper={Wrapper} tableId={1} isOpen={true} />);

    expect(screen.getByRole('status')).toHaveTextContent('loading');
  });

  test('토큰 발급 실패 상태를 보여준다', () => {
    useGetChairmanTokenMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    render(<LiveShareModal Wrapper={Wrapper} tableId={1} isOpen={true} />);

    expect(screen.getByText('라이브 공유 불가')).toBeInTheDocument();
    expect(
      screen.getByText('사회자 인증 토큰 발급에 실패했어요...'),
    ).toBeInTheDocument();
  });

  test('소켓 연결 실패 상태를 보여준다', () => {
    useGetChairmanTokenMock.mockReturnValue({
      data: 'chairman-token',
      isPending: false,
      isError: false,
    });
    useChairmanSocketMock.mockReturnValue({
      connect,
      disconnect,
      isConnected: false,
      error: new Error('socket failure'),
    });

    render(<LiveShareModal Wrapper={Wrapper} tableId={1} isOpen={true} />);

    expect(screen.getByText('라이브 공유 불가')).toBeInTheDocument();
    expect(
      screen.getByText('라이브 서버 연결에 실패했어요...'),
    ).toBeInTheDocument();
  });

  test('토큰을 받은 뒤 소켓 연결 전까지 로딩 상태를 보여준다', async () => {
    useGetChairmanTokenMock.mockReturnValue({
      data: 'chairman-token',
      isPending: false,
      isError: false,
    });

    render(<LiveShareModal Wrapper={Wrapper} tableId={1} isOpen={true} />);

    expect(screen.getByRole('status')).toHaveTextContent('loading');
    expect(screen.queryByLabelText('qr-code')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });
  });

  test('성공 상태에서 QR 코드를 보여주고 소켓을 연결한다', async () => {
    useGetChairmanTokenMock.mockReturnValue({
      data: 'chairman-token',
      isPending: false,
      isError: false,
    });
    useChairmanSocketMock.mockReturnValue({
      connect,
      disconnect,
      isConnected: true,
      error: null,
    });

    render(<LiveShareModal Wrapper={Wrapper} tableId={1} isOpen={true} />);

    expect(screen.getByText('토론 타이머 화면 공유')).toBeInTheDocument();
    expect(screen.getByLabelText('qr-code')).toHaveAttribute(
      'data-value',
      `${window.location.origin}/live/1`,
    );
    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });
  });
});
