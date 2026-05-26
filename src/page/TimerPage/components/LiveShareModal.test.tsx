import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import LiveShareModal from './LiveShareModal';
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from '@tanstack/react-query';
import useGetChairmanToken from '../../../hooks/query/useGetChairmanToken';

const useChairmanSocketMock = vi.hoisted(() => vi.fn());

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg aria-label="qr-code" data-value={value} />
  ),
}));

vi.mock('../../../components/LoadingSpinner', () => ({
  default: () => <div role="status">loading</div>,
}));

vi.mock('../../../hooks/query/useGetChairmanToken', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../../hooks/query/useGetChairmanToken')
    >();
  return {
    ...actual,
    default: vi.fn(),
  };
});

vi.mock('../../../hooks/sockets/useChairmanSocket', () => ({
  default: useChairmanSocketMock,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function TestProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function DummyModalWrapper({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

describe('LiveShareModal', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    useChairmanSocketMock.mockReturnValue({
      connect,
      disconnect,
      isConnected: false,
      error: null,
    });
  });

  test('토큰을 불러오는 동안 로딩 상태를 보여준다', () => {
    // 로딩 테스트 시에는 msw로 모방한 토큰 API가 아닌 무조건 `isPending = true`를 뱉는 모방 API를 사용
    vi.mocked(useGetChairmanToken).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    } as UseQueryResult<string, Error>);

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    expect(screen.getByRole('status')).toHaveTextContent('loading');
  });

  test('토큰 발급 실패 상태를 보여준다', () => {
    // 실패 테스트 시에는 msw로 모방한 토큰 API가 아닌 무조건 `isError = true`를 뱉는 모방 API를 사용
    vi.mocked(useGetChairmanToken).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    } as UseQueryResult<string, Error>);

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    expect(screen.getByText('라이브 공유 불가')).toBeInTheDocument();
    expect(
      screen.getByText('사회자 인증 토큰 발급에 실패했어요...'),
    ).toBeInTheDocument();
  });

  test('소켓 연결 실패 상태를 보여준다', () => {
    vi.mocked(useGetChairmanToken).mockReturnValue({
      data: 'chairman-token',
      isPending: false,
      isError: false,
    } as UseQueryResult<string, Error>);
    useChairmanSocketMock.mockReturnValue({
      connect,
      disconnect,
      isConnected: false,
      error: new Error('socket failure'),
    });

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    expect(screen.getByText('라이브 공유 불가')).toBeInTheDocument();
    expect(
      screen.getByText('라이브 서버 연결에 실패했어요...'),
    ).toBeInTheDocument();
  });

  test('토큰을 받은 뒤 소켓 연결 전까지 로딩 상태를 보여준다', async () => {
    vi.mocked(useGetChairmanToken).mockReturnValue({
      data: 'chairman-token',
      isPending: false,
      isError: false,
    } as UseQueryResult<string, Error>);

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    expect(screen.getByRole('status')).toHaveTextContent('loading');
    expect(screen.queryByLabelText('qr-code')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });
  });

  test('성공 상태에서 QR 코드를 보여주고 소켓을 연결한다', async () => {
    // 성공 시에는 실제 훅을 사용하여 MSW 응답을 활용합니다.
    const actual = await vi.importActual<
      typeof import('../../../hooks/query/useGetChairmanToken')
    >('../../../hooks/query/useGetChairmanToken');
    vi.mocked(useGetChairmanToken).mockImplementation(actual.default);

    useChairmanSocketMock.mockReturnValue({
      connect,
      disconnect,
      isConnected: true,
      error: null,
    });

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    // API 요청이 끝나고 성공 상태로 전환될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('토론 타이머 화면 공유')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('qr-code')).toHaveAttribute(
      'data-value',
      `${window.location.origin}/live/1`,
    );
    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });
  });
});
