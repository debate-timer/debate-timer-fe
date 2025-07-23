import { ReactNode, useState, useCallback, useEffect } from 'react';
import { GlobalPortal } from '../util/GlobalPortal';
import DTClose from '../components/icons/Close';

interface UseModalOptions {
  closeOnOverlayClick?: boolean;
  isCloseButtonExist?: boolean;
  onClose?: () => void;
}

/**
 * 모달을 쉽게 열고 닫을 수 있는 훅.
 * @param options 모달 표시 옵션
 */
export function useModal(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    closeOnOverlayClick = true,
    isCloseButtonExist = true,
    onClose = () => {},
  } = options;

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    onClose();
    setIsOpen(false);
  }, [onClose]);

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
      e.stopPropagation();
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        closeModal();
      }
    },
    [closeModal, closeOnOverlayClick],
  );

  const ModalWrapper = ({
    children,
    closeButtonColor = 'text-neutral-0 hover:text-gray-300',
  }: {
    children: ReactNode;
    closeButtonColor?: string;
  }) => {
    if (!isOpen) return null;

    return (
      <GlobalPortal.Consumer>
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <div className="relative overflow-hidden rounded-lg bg-white shadow-lg">
            {children}
            {isCloseButtonExist && (
              <button
                type="button"
                onClick={closeModal}
                className={`absolute right-4 top-4 text-3xl ${closeButtonColor}`}
                aria-label="모달 닫기"
              >
                <DTClose className="size-[32px] text-default-black" />
              </button>
            )}
          </div>
        </div>
      </GlobalPortal.Consumer>
    );
  };

  return { isOpen, openModal, closeModal, ModalWrapper };
}
