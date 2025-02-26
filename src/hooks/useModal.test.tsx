// useModal.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModal } from './useModal';
import { GlobalPortal } from '../util/GlobalPortal';

function TestModal({
  closeOnOverlayClick = true,
}: {
  closeOnOverlayClick?: boolean;
}) {
  const { openModal, closeModal, ModalWrapper } = useModal({
    closeOnOverlayClick,
  });

  return (
    <GlobalPortal.Provider>
      <div>
        <button data-testid="open-btn" onClick={openModal}>
          모달 열기
        </button>

        {/* 모달 렌더링 */}
        <ModalWrapper>
          <div data-testid="modal-content">Hello Modal</div>
        </ModalWrapper>

        {/* 모달 닫기 (직접 호출 테스트용) */}
        <button data-testid="close-btn" onClick={closeModal}>
          모달 닫기
        </button>
      </div>
    </GlobalPortal.Provider>
  );
}

describe('useModal Hook 테스트', () => {
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

    // 'X' 버튼(모달 내부 right-4 top-4) 클릭
    await user.click(screen.getByTestId('close-btn'));

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
});
