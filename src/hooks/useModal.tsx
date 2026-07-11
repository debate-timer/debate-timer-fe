import { useTranslation } from 'react-i18next';
import { ReactNode, useState, useCallback, useEffect } from 'react';
import { GlobalPortal } from '../util/GlobalPortal';
import DTClose from '../components/icons/Close';

interface UseModalOptions {
  closeOnOverlayClick?: boolean;
  isCloseButtonExist?: boolean;
  onClose?: () => void;
}

interface ModalWrapperProps {
  children: ReactNode;
  closeButtonColor?: string;
}

// onClose가 없을 때 렌더마다 새 빈 함수를 만들면 연관된 콜백과 ModalWrapper의 참조도 바뀐다.
// 동일한 기본 함수를 재사용해 열린 모달이 불필요하게 재마운트되지 않도록 한다.
function noop() {}

/**
 * 모달을 쉽게 열고 닫을 수 있는 훅.
 * @param options 모달 표시 옵션
 */
export function useModal(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    closeOnOverlayClick = true,
    isCloseButtonExist = true,
    onClose = noop,
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

  const ModalWrapper = useCallback(
    function ModalWrapper({
      children,
      closeButtonColor = 'text-neutral-0 hover:text-gray-300',
    }: ModalWrapperProps) {
      const { t } = useTranslation();
      if (!isOpen) return null;

      return (
        <GlobalPortal.Consumer>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleOverlayClick}
          >
            <div className="relative overflow-hidden rounded-[20px] bg-white shadow-lg">
              {children}
              {isCloseButtonExist && (
                <button
                  type="button"
                  onClick={closeModal}
                  className={`absolute right-4 top-4 text-3xl ${closeButtonColor}`}
                  aria-label={t('모달 닫기')}
                >
                  <DTClose className="size-[32px]" />
                </button>
              )}
            </div>
          </div>
        </GlobalPortal.Consumer>
      );
    },
    [closeModal, handleOverlayClick, isCloseButtonExist, isOpen],
  );

  return { isOpen, openModal, closeModal, ModalWrapper };
}
