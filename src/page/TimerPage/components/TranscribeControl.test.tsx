import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalPortal } from '../../../util/GlobalPortal';
import TranscribeControl, { TranscribeControlProps } from './TranscribeControl';

const baseProps: TranscribeControlProps = {
  supportedModes: { RPC: true, SONIOX: true },
  sttMode: 'RPC',
  isModeLocked: false,
  isEnabled: false,
  isListening: false,
  interimText: '',
  utteranceCount: 0,
  pendingCount: 0,
  failedCount: 0,
  error: null,
  onEnable: vi.fn(),
  onDisable: vi.fn(),
};

function renderControl(props: Partial<TranscribeControlProps> = {}) {
  const merged = {
    ...baseProps,
    onEnable: vi.fn(),
    onDisable: vi.fn(),
    ...props,
  };
  render(
    <GlobalPortal.Provider>
      <TranscribeControl {...merged} />
    </GlobalPortal.Provider>,
  );
  return merged;
}

describe('TranscribeControl', () => {
  it('기록이 꺼져 있을 때 누르면 동의를 받은 뒤 고른 모드로 기록을 켠다', async () => {
    const user = userEvent.setup();
    const props = renderControl();

    await user.click(screen.getByRole('button', { name: '토론 기록 켜기' }));
    expect(props.onEnable).not.toHaveBeenCalled();
    expect(
      screen.getByText('토론 음성 기록에 동의하시나요?'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '동의하고 기록하기' }));

    expect(props.onEnable).toHaveBeenCalledWith('RPC');
  });

  it('동의 화면에서 Soniox 배치 전사 모드를 고를 수 있다', async () => {
    const user = userEvent.setup();
    const props = renderControl();

    await user.click(screen.getByRole('button', { name: '토론 기록 켜기' }));
    await user.click(
      screen.getByRole('radio', { name: /발언 후 일괄 인식 \(Soniox\)/ }),
    );
    expect(
      screen.getByText(/발언 구간이 끝날 때마다 녹음한 오디오를 서버로 보내/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '동의하고 기록하기' }));

    expect(props.onEnable).toHaveBeenCalledWith('SONIOX');
  });

  it('지원하지 않는 모드는 고를 수 없다', async () => {
    const user = userEvent.setup();
    renderControl({ supportedModes: { RPC: false, SONIOX: true } });

    await user.click(screen.getByRole('button', { name: '토론 기록 켜기' }));

    expect(
      screen.getByRole('radio', { name: /실시간 인식 \(크롬\)/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole('radio', { name: /발언 후 일괄 인식 \(Soniox\)/ }),
    ).toBeChecked();
  });

  it('이미 기록을 시작한 모드는 다시 켤 때 바꿀 수 없다', async () => {
    const user = userEvent.setup();
    const props = renderControl({ sttMode: 'SONIOX', isModeLocked: true });

    await user.click(screen.getByRole('button', { name: '토론 기록 켜기' }));

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '동의하고 기록하기' }));
    expect(props.onEnable).toHaveBeenCalledWith('SONIOX');
  });

  it('동의를 취소하면 기록을 켜지 않는다', async () => {
    const user = userEvent.setup();
    const props = renderControl();

    await user.click(screen.getByRole('button', { name: '토론 기록 켜기' }));
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(props.onEnable).not.toHaveBeenCalled();
  });

  it('기록 중에 누르면 기록을 끈다', async () => {
    const user = userEvent.setup();
    const props = renderControl({ isEnabled: true });

    const button = screen.getByRole('button', { name: '토론 기록 끄기' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await user.click(button);

    expect(props.onDisable).toHaveBeenCalledTimes(1);
  });

  it('인식 중인 문장과 기록한 문장 수를 보여준다', () => {
    renderControl({
      isEnabled: true,
      isListening: true,
      interimText: '찬성 측 입론',
      utteranceCount: 3,
    });

    expect(screen.getByText('찬성 측 입론')).toBeInTheDocument();
    expect(screen.getByText('3문장')).toBeInTheDocument();
  });

  it('Soniox 모드는 녹음 상태와 전사 중·실패 구간 수를 보여준다', () => {
    renderControl({
      sttMode: 'SONIOX',
      isEnabled: true,
      isListening: true,
      pendingCount: 2,
      failedCount: 1,
    });

    expect(screen.getByText('녹음 중')).toBeInTheDocument();
    expect(screen.getByText('2개 구간 전사 중')).toBeInTheDocument();
    expect(screen.getByText('1개 구간 전사 실패')).toBeInTheDocument();
  });

  it('브라우저가 어떤 기록 모드도 지원하지 않으면 버튼 대신 안내를 보여준다', () => {
    renderControl({ supportedModes: { RPC: false, SONIOX: false } });

    expect(
      screen.queryByRole('button', { name: '토론 기록 켜기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('이 브라우저에서는 토론 기록을 사용할 수 없어요'),
    ).toBeInTheDocument();
  });

  it('마이크 권한이 거부되면 안내를 보여준다', () => {
    renderControl({ error: 'not-allowed' });

    expect(
      screen.getByText('마이크 권한을 허용해야 토론을 기록할 수 있어요'),
    ).toBeInTheDocument();
  });
});
