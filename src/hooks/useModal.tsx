import { ReactNode, useState, useCallback } from 'react';
import { GlobalPortal } from '../util/GlobalPortal';

interface UseModalOptions {
  closeOnOverlayClick?: boolean;
}

/**
 * 모달을 쉽게 열고 닫을 수 있는 훅.
 * @param content 모달 내부에 렌더링할 ReactNode
 * @param options 모달 표시 옵션
 */
export function useModal(content: ReactNode, options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const { closeOnOverlayClick = true } = options;

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
