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

// 모달 밖의 버튼에 포커스를 둔 뒤 모달을 열고 닫을 수 있게 렌더링한다.
function renderWithTrigger() {
  const renderTree = (isOpen: boolean) => (
    <GlobalPortal.Provider>
      <button>타이머 버튼</button>
      <TranscriptLeaveModal
        isOpen={isOpen}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    </GlobalPortal.Provider>
  );
  const view = render(renderTree(false));
  screen.getByRole('button', { name: '타이머 버튼' }).focus();
  view.rerender(renderTree(true));
  return {
    close: () => view.rerender(renderTree(false)),
  };
}

describe('속기록 유실 안내 모달(TranscriptLeaveModal)은', () => {
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

  it('경고 문구를 대화상자의 설명으로 연결한다', () => {
    renderModal(true);

    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription(
      '지금 나가면 토론 기록이 사라져요.\n그래도 나가시겠어요?',
    );
  });

  describe('포커스는', () => {
    it('열리면 취소 버튼으로 이동한다', () => {
      renderWithTrigger();

      expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();
    });

    it('Tab을 눌러도 모달 안에서만 순환한다', async () => {
      const user = userEvent.setup();
      renderWithTrigger();

      await user.tab();
      expect(screen.getByRole('button', { name: '확인' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();
    });

    it('Shift+Tab을 눌러도 모달 안에서만 순환한다', async () => {
      const user = userEvent.setup();
      renderWithTrigger();

      await user.tab({ shift: true });

      expect(screen.getByRole('button', { name: '확인' })).toHaveFocus();
    });

    it('닫히면 열기 전 요소로 돌아간다', () => {
      const { close } = renderWithTrigger();

      close();

      expect(screen.getByRole('button', { name: '타이머 버튼' })).toHaveFocus();
    });
  });
});
