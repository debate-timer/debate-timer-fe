import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalPortal } from '../../../util/GlobalPortal';
import AudienceRecordingControl, {
  AudienceRecordingControlProps,
} from './AudienceRecordingControl';

const baseProps: AudienceRecordingControlProps = {
  isAvailable: true,
  isSupported: true,
  status: 'idle',
  isListening: false,
  error: null,
  failedCount: 0,
  onStart: vi.fn(),
  onStop: vi.fn(),
};

const renderControl = (props: Partial<AudienceRecordingControlProps> = {}) =>
  render(
    <GlobalPortal.Provider>
      <AudienceRecordingControl {...baseProps} {...props} />
    </GlobalPortal.Provider>,
  );

describe('청중 녹음 참여 컨트롤', () => {
  it('공유 링크에 녹음 참여 정보가 없으면 보여주지 않는다', () => {
    renderControl({ isAvailable: false });

    expect(
      screen.queryByRole('button', { name: '녹음 참여' }),
    ).not.toBeInTheDocument();
  });

  it('동의해야 녹음 참여를 시작한다', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    renderControl({ onStart });

    await user.click(screen.getByRole('button', { name: '녹음 참여' }));
    expect(onStart).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', { name: '토론 녹음에 참여할까요?' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '동의하고 참여' }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('동의하지 않으면 참여하지 않고 보기만 계속한다', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    renderControl({ onStart });

    await user.click(screen.getByRole('button', { name: '녹음 참여' }));
    await user.click(screen.getByRole('button', { name: '참여하지 않기' }));

    expect(onStart).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: '녹음 참여' }),
    ).toBeInTheDocument();
  });

  it('참여 중에는 녹음 상태와 업로드 실패를 알리고 그만둘 수 있다', async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    renderControl({
      status: 'recording',
      isListening: true,
      failedCount: 2,
      onStop,
    });

    expect(
      screen.getByText('이 기기로 녹음하는 중이에요.'),
    ).toBeInTheDocument();
    expect(screen.getByText('2개 구간을 올리지 못했어요.')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: '녹음 참여 그만하기' }),
    );

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('참여 중이지만 타이머가 멈춰 있으면 시작을 기다린다고 알린다', () => {
    renderControl({ status: 'recording', isListening: false });

    expect(
      screen.getByText('녹음에 참여 중이에요. 타이머가 시작되면 녹음해요.'),
    ).toBeInTheDocument();
  });

  it.each([
    ['not-allowed', '마이크 권한을 허용해야 녹음에 참여할 수 있어요.'],
    ['join', '녹음에 참여하지 못했어요. 링크를 다시 확인해 주세요.'],
  ] as const)('%s 오류를 알린다', (error, message) => {
    renderControl({ error });

    expect(screen.getByRole('alert')).toHaveTextContent(message);
  });

  it('녹음을 지원하지 않는 브라우저면 참여 버튼 대신 안내한다', () => {
    renderControl({ isSupported: false });

    expect(
      screen.queryByRole('button', { name: '녹음 참여' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('이 브라우저에서는 녹음에 참여할 수 없어요.'),
    ).toBeInTheDocument();
  });
});
