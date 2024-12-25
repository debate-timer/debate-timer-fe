import { ReactNode, useState, useCallback, useEffect } from 'react';
import { GlobalPortal } from '../util/GlobalPortal';

interface UseModalOptions {
  closeOnOverlayClick?: boolean;
}

/**
 * 모달을 쉽게 열고 닫을 수 있는 훅.
 * @param options 모달 표시 옵션
 */
export function useModal(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const { closeOnOverlayClick = true } = options;

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        closeModal();
      }
    },
    [closeModal, closeOnOverlayClick],
  );

  const ModalWrapper = ({ children }: { children: ReactNode }) => {
    if (!isOpen) return null;

    return (
      <GlobalPortal.Consumer>
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <div className="relative w-2/3 rounded-lg bg-white shadow-lg">
            {children}
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-6 text-4xl text-gray-500 hover:text-gray-700"
            >
              X
            </button>
          </div>
        </div>
      </GlobalPortal.Consumer>
    );
  };

  return { isOpen, openModal, closeModal, ModalWrapper };
}
