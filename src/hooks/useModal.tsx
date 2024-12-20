import { ReactNode, useState, useCallback } from 'react';
import { GlobalPortal } from '../util/GlobalPortal';

interface UseModalOptions {
  closeOnOverlayClick?: boolean;
  onSubmit?: () => void; // 제출 버튼 클릭 시 실행되는 콜백
}

/**
 * 모달을 쉽게 열고 닫을 수 있는 훅.
 * @param content 모달 내부에 렌더링할 ReactNode
 * @param options 모달 표시 옵션
 */
export function useModal(content: ReactNode, options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const { closeOnOverlayClick = true, onSubmit } = options;

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        closeModal();
      }
    },
    [closeModal, closeOnOverlayClick],
  );

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit();
    }
    closeModal(); // 제출 후 모달 닫기
  }, [onSubmit, closeModal]);

  const ModalComponent = () => {
    if (!isOpen) return null;

    return (
      <GlobalPortal.Consumer>
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <div className="relative rounded-lg bg-white p-5 shadow-lg">
            {content}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
              >
                닫기
              </button>
              {onSubmit && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  제출
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              X
            </button>
          </div>
        </div>
      </GlobalPortal.Consumer>
    );
  };

  return { isOpen, openModal, closeModal, ModalComponent };
}
