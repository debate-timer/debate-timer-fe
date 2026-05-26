import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import LiveShareModal from './LiveShareModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../../../mocks/server';
import { ApiUrl } from '../../../apis/endpoints';
import { GetChairmanTokenResponseType } from '../../../apis/responses/live';

const useChairmanSocketMock = vi.hoisted(() => vi.fn());

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg aria-label="qr-code" data-value={value} />
  ),
}));

vi.mock('../../../components/LoadingSpinner', () => ({
  default: () => <div role="status">loading</div>,
}));

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

function mockChairmanTokenSuccess(
  chairmanToken: string = 'mock-chairman-token-12345',
) {
  const response: GetChairmanTokenResponseType = { chairmanToken };

  server.use(
    http.get(`${ApiUrl.live}/:tableId/chairman-token`, () =>
      HttpResponse.json(response),
    ),
  );
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
    server.use(
      http.get(`${ApiUrl.live}/:tableId/chairman-token`, async () => {
        await delay(1000);
        return HttpResponse.json<GetChairmanTokenResponseType>({
          chairmanToken: 'delayed-chairman-token',
        });
      }),
    );

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    expect(screen.getByRole('status')).toHaveTextContent('loading');
  });

  test('토큰 발급 실패 상태를 보여준다', async () => {
    server.use(
      http.get(`${ApiUrl.live}/:tableId/chairman-token`, () =>
        HttpResponse.json({ message: 'token failed' }, { status: 500 }),
      ),
    );

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    expect(await screen.findByText('라이브 공유 불가')).toBeInTheDocument();
    expect(
      await screen.findByText('사회자 인증 토큰 발급에 실패했어요...'),
    ).toBeInTheDocument();
  });

  test('소켓 연결 실패 상태를 보여준다', () => {
    mockChairmanTokenSuccess('chairman-token');
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
    mockChairmanTokenSuccess('chairman-token');

    render(
      <LiveShareModal Wrapper={DummyModalWrapper} tableId={1} isOpen={true} />,
      { wrapper: TestProvider },
    );

    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole('status')).toHaveTextContent('loading');
    expect(screen.queryByLabelText('qr-code')).not.toBeInTheDocument();
  });

  test('성공 상태에서 QR 코드를 보여주고 소켓을 연결한다', async () => {
    mockChairmanTokenSuccess('chairman-token');

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
