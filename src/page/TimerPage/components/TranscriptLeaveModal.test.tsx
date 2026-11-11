import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalPortal } from '../../../util/GlobalPortal';
import TranscriptLeaveModal from './TranscriptLeaveModal';

function renderModal(isOpen: boolean) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <GlobalPortal.Provider>
      <TranscriptLeaveModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </GlobalPortal.Provider>,
  );
  return { onConfirm, onCancel };
}

describe('TranscriptLeaveModal', () => {
  it('열려 있으면 속기록 유실 안내를 두 줄로 보여준다', () => {
    renderModal(true);

    expect(screen.getByText('토론 기록이 진행 중이에요')).toBeInTheDocument();
    // 기본 normalizer는 줄바꿈을 공백으로 합치므로 원문 그대로 비교한다.
    expect(
      screen.getByText(
        '지금 나가면 토론 기록이 사라져요.\n그래도 나가시겠어요?',
        { normalizer: (text) => text },
      ),
    ).toHaveClass('whitespace-pre-line');
  });

  it('닫혀 있으면 아무것도 보여주지 않는다', () => {
    renderModal(false);

    expect(
      screen.queryByText('토론 기록이 진행 중이에요'),
    ).not.toBeInTheDocument();
  });

  it('확인 버튼을 누르면 onConfirm을 호출한다', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderModal(true);

    await user.click(screen.getByRole('button', { name: '확인' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('취소 버튼을 누르면 onCancel을 호출한다', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderModal(true);

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('바깥 영역을 눌러도 나가지 않고 onCancel을 호출한다', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderModal(true);

    await user.click(screen.getByTestId('transcript-leave-overlay'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Escape 키를 눌러도 나가지 않고 onCancel을 호출한다', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderModal(true);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
