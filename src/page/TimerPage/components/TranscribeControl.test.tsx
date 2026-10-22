import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalPortal } from '../../../util/GlobalPortal';
import TranscribeControl, { TranscribeControlProps } from './TranscribeControl';

const baseProps: TranscribeControlProps = {
  isSupported: true,
  isEnabled: false,
  isListening: false,
  interimText: '',
  utteranceCount: 0,
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
  it('기록이 꺼져 있을 때 누르면 동의를 받은 뒤 기록을 켠다', async () => {
    const user = userEvent.setup();
    const props = renderControl();

    await user.click(screen.getByRole('button', { name: '토론 기록 켜기' }));
    expect(props.onEnable).not.toHaveBeenCalled();
    expect(
      screen.getByText('토론 음성 기록에 동의하시나요?'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '동의하고 기록하기' }));

    expect(props.onEnable).toHaveBeenCalledTimes(1);
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
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('브라우저가 음성 인식을 지원하지 않으면 버튼 대신 안내를 보여준다', () => {
    renderControl({ isSupported: false });

    expect(
      screen.queryByRole('button', { name: '토론 기록 켜기' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('토론 기록은 크롬 브라우저에서만 사용할 수 있어요'),
    ).toBeInTheDocument();
  });

  it('마이크 권한이 거부되면 안내를 보여준다', () => {
    renderControl({ error: 'not-allowed' });

    expect(
      screen.getByText('마이크 권한을 허용해야 토론을 기록할 수 있어요'),
    ).toBeInTheDocument();
  });
});
