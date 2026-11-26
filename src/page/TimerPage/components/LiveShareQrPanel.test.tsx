import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { copyToClipboard } from '../../../util/clipboard';
import LiveShareQrPanel from './LiveShareQrPanel';

vi.mock('../../../util/clipboard', () => ({ copyToClipboard: vi.fn() }));
const URL = 'https://example.org/live/5#rec=session&code=sample';

function panel(url: string) {
  return <LiveShareQrPanel key={url} shareUrl={url} />;
}

describe('청중 입장 QR과 링크 복사', () => {
  beforeEach(() =>
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null),
  );
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it('현재 주소를 복사하고 주소가 바뀌면 성공 안내를 지운다', async () => {
    vi.mocked(copyToClipboard).mockResolvedValue(true);
    const user = userEvent.setup();
    const view = render(panel(URL));
    await user.click(screen.getByRole('button', { name: '링크 복사' }));
    expect(copyToClipboard).toHaveBeenCalledWith(URL);
    expect(
      screen.getByRole('button', { name: '복사 완료' }),
    ).toBeInTheDocument();
    view.rerender(panel('https://example.org/live/5'));
    expect(
      screen.getByRole('button', { name: '링크 복사' }),
    ).toBeInTheDocument();
  });
  it('QR 아래에 링크 복사와 이미지 다운로드 버튼을 표시한다', () => {
    render(panel(URL));
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    const qr = screen.getByRole('img', { name: '실시간 공유 QR 코드' });
    for (const name of ['링크 복사', 'QR 이미지 다운로드']) {
      const button = screen.getByRole('button', { name });
      expect(qr.compareDocumentPosition(button)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }
  });
  it('링크 복사 실패 시 전체 주소를 선택할 수 있다', async () => {
    vi.mocked(copyToClipboard).mockResolvedValue(false);
    render(panel(URL));
    await userEvent.click(screen.getByRole('button', { name: '링크 복사' }));
    expect(screen.getByRole('textbox', { name: '청중 입장 링크' })).toHaveValue(
      URL,
    );
  });
  it('표시한 QR을 PNG 파일로 다운로드한다', async () => {
    const png = 'data:image/png;base64,AAAA';
    const encode = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue(png);
    const download = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    render(panel(URL));
    await userEvent.click(
      screen.getByRole('button', { name: 'QR 이미지 다운로드' }),
    );
    expect(encode.mock.contexts[0]).toBe(
      screen.getByRole('img', { name: '실시간 공유 QR 코드' }),
    );
    expect(encode).toHaveBeenCalledWith('image/png');
    expect(download.mock.contexts[0]).toHaveAttribute(
      'download',
      'debate-timer-qr.png',
    );
    expect(download.mock.contexts[0]).toHaveAttribute('href', png);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('PNG를 만들 수 없으면 링크 복사를 안내한다', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:,',
    );
    render(panel(URL));
    await userEvent.click(
      screen.getByRole('button', { name: 'QR 이미지 다운로드' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'QR 이미지를 다운로드하지 못했어요. 링크를 복사해 주세요.',
    );
    expect(screen.getByRole('button', { name: '링크 복사' })).toBeEnabled();
  });
});
