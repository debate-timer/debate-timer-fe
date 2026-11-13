// useModal.test.tsx
import { render, screen, within, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useState } from 'react';
import { useModal } from './useModal';
import { GlobalPortal } from '../util/GlobalPortal';

function TestModal({
  closeOnOverlayClick = true,
  isCloseButtonExist = true,
  showCloseButton,
  content,
  hasDialogContent,
}: {
  closeOnOverlayClick?: boolean;
  isCloseButtonExist?: boolean;
  showCloseButton?: boolean;
  content?: ReactNode;
  hasDialogContent?: boolean;
}) {
  const [renderCount, setRenderCount] = useState(0);
  const { openModal, closeModal, ModalWrapper } = useModal({
    closeOnOverlayClick,
    isCloseButtonExist,
  });

  return (
    <GlobalPortal.Provider>
      <div>
        <button data-testid="open-btn" onClick={openModal}>
          모달 열기
        </button>
        <button onClick={() => setRenderCount((count) => count + 1)}>
          부모 리렌더 {renderCount}
        </button>

        {/* 모달 렌더링 */}
        <ModalWrapper
          showCloseButton={showCloseButton}
          hasDialogContent={hasDialogContent}
        >
          <div data-testid="modal-content">
            {content ?? (
              <>
                <span>Hello Modal</span>
                <input aria-label="모달 입력" />
              </>
            )}
          </div>
        </ModalWrapper>

        {/* 모달 닫기 (직접 호출 테스트용) */}
        <button data-testid="close-btn" onClick={closeModal}>
          직접 닫기
        </button>
      </div>
    </GlobalPortal.Provider>
  );
}

describe('useModal Hook 테스트', () => {
  it('자식의 대화상자 역할을 중복하지 않고 자식 조작에 포커스한다', async () => {
    const user = userEvent.setup();
    render(
      <TestModal
        hasDialogContent
        showCloseButton={false}
        content={
          <section role="dialog" aria-modal="true" aria-label="업데이트">
            <button>내용 확인</button>
          </section>
        }
      />,
    );
    await user.click(screen.getByTestId('open-btn'));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(
      screen.getByRole('dialog', { name: '업데이트' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '내용 확인' })).toHaveFocus();
  });

  it('조작이 없는 창은 컨테이너에 포커스를 유지한다', async () => {
    const user = userEvent.setup();
    render(<TestModal showCloseButton={false} content={<p>안내</p>} />);
    await user.click(screen.getByTestId('open-btn'));
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('open-btn')).toHaveFocus();
  });

  it('숨김·비활성 조작을 건너뛰고 외부 포커스를 창 안으로 되돌린다', async () => {
    const user = userEvent.setup();
    render(
      <TestModal
        showCloseButton={false}
        content={
          <>
            <div style={{ display: 'none' }}>
              <button>숨김</button>
            </div>
            <button disabled>비활성</button>
            <button>활성</button>
          </>
        }
      />,
    );
    await user.click(screen.getByTestId('open-btn'));
    const activeButton = screen.getByRole('button', { name: '활성' });
    expect(activeButton).toHaveFocus();
    screen.getByTestId('open-btn').focus();
    expect(activeButton).toHaveFocus();
    await user.tab();
    expect(activeButton).toHaveFocus();
  });
  it('대화상자 이름을 제공하고 포커스를 순환한 뒤 열기 버튼으로 복귀한다', async () => {
    const user = userEvent.setup();
    render(<TestModal />);
    const opener = screen.getByTestId('open-btn');
    await user.click(opener);
    const dialog = screen.getByRole('dialog');
    const close = within(dialog).getByRole('button', { name: '모달 닫기' });
    expect(dialog).toHaveAccessibleName();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(opener).toHaveFocus();
  });

  it('닫힌 훅은 Escape를 처리하지 않는다', async () => {
    const onClose = vi.fn();
    renderHook(() => useModal({ onClose }));
    await userEvent.setup().keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('중첩 모달에서는 최상위 창만 닫고 바로 아래 열기 버튼으로 복귀한다', async () => {
    const user = userEvent.setup();
    render(<NestedModals />);
    await user.click(screen.getByRole('button', { name: '바깥 열기' }));
    const innerOpener = screen.getByRole('button', { name: '안쪽 열기' });
    await user.click(innerOpener);
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    await user.keyboard('{Escape}');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(innerOpener).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '바깥 열기' })).toHaveFocus();
  });
  test('초기에는 모달이 닫혀 있다.', () => {
    render(<TestModal />);

    // 화면에 모달 내용이 없어야 함
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  test('openModal을 호출하면 모달이 열린다.', async () => {
    const user = userEvent.setup();
    render(<TestModal />);

    // 열기 버튼 클릭
    await user.click(screen.getByTestId('open-btn'));

    // 모달이 열렸는지 확인
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  test('closeModal을 호출하면 모달이 닫힌다.', async () => {
    const user = userEvent.setup();
    render(<TestModal />);

    // 모달 열기
    await user.click(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();

    // 직접 closeModal 호출
    await user.click(screen.getByTestId('close-btn'));

    // 모달이 사라졌는지 확인
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  test('closeOnOverlayClick 옵션이 true이면, 오버레이 클릭 시 모달이 닫힌다.', async () => {
    const user = userEvent.setup();
    render(<TestModal closeOnOverlayClick={true} />);

    // 모달 열기
    await user.click(screen.getByTestId('open-btn'));
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeInTheDocument();

    // 부모(오버레이) 요소 찾기
    const overlay = modalContent.parentElement?.parentElement;
    // 실제로 null이 아닌지 보장하기 위해 체크
    expect(overlay).toBeTruthy();
    if (!overlay) throw new Error('Overlay가 없습니다.');

    await user.click(overlay);

    // 모달이 닫혔는지 확인
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  test('X 버튼을 클릭하면 모달이 닫힌다.', async () => {
    const user = userEvent.setup();
    render(<TestModal />);

    // 모달 열기
    await user.click(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '모달 닫기' }));

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('취소 수단이 있는 확인창은 닫기 버튼을 숨기고 Escape로 닫을 수 있다.', async () => {
    const user = userEvent.setup();
    render(<TestModal showCloseButton={false} />);
    await user.click(screen.getByTestId('open-btn'));
    expect(
      screen.queryByRole('button', { name: '모달 닫기' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('훅에서 닫기 버튼을 숨겨도 개별 창은 명시적으로 표시할 수 있다.', async () => {
    const user = userEvent.setup();
    render(<TestModal isCloseButtonExist={false} showCloseButton />);
    await user.click(screen.getByTestId('open-btn'));
    await user.click(screen.getByRole('button', { name: '모달 닫기' }));
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  test('closeOnOverlayClick 옵션이 false면, 오버레이를 클릭해도 모달이 닫히지 않는다.', async () => {
    const user = userEvent.setup();
    render(<TestModal closeOnOverlayClick={false} />);

    // 모달 열기
    await user.click(screen.getByTestId('open-btn'));
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeInTheDocument();

    // 부모(오버레이) 요소 찾기
    const overlay = modalContent.parentElement?.parentElement;
    // 실제로 null이 아닌지 보장하기 위해 체크
    expect(overlay).toBeTruthy();
    if (!overlay) throw new Error('Overlay가 없습니다.');

    await user.click(overlay);
    // 여전히 모달이 열린 상태
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  test('부모가 리렌더되어도 열린 모달의 내부 상태를 유지한다.', async () => {
    const user = userEvent.setup();
    render(<TestModal />);

    await user.click(screen.getByTestId('open-btn'));
    const inputBeforeRerender = screen.getByRole('textbox', {
      name: '모달 입력',
    });
    await user.type(inputBeforeRerender, '입력값');

    await user.click(screen.getByRole('button', { name: '부모 리렌더 0' }));

    const inputAfterRerender = screen.getByRole('textbox', {
      name: '모달 입력',
    });
    expect(inputAfterRerender).toBe(inputBeforeRerender);
    expect(inputAfterRerender).toHaveValue('입력값');
  });
});

function NestedModals() {
  const outer = useModal();
  const inner = useModal();
  return (
    <GlobalPortal.Provider>
      <button onClick={outer.openModal}>바깥 열기</button>
      <outer.ModalWrapper aria-label="바깥 창">
        <button onClick={inner.openModal}>안쪽 열기</button>
        <inner.ModalWrapper aria-label="안쪽 창">
          <p>안쪽 내용</p>
        </inner.ModalWrapper>
      </outer.ModalWrapper>
    </GlobalPortal.Provider>
  );
}
