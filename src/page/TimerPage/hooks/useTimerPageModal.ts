import { useEffect, useState } from 'react';
import { useModal } from '../../../hooks/useModal';

export default function useTimerPageModal() {
  const [isFirst, setIsFirst] = useState(false);
  const IS_FIRST = 'isFirst';
  const TRUE = 'true';
  const FALSE = 'false';
  const {
    openModal: openUseTooltipModal,
    closeModal: closeUseTooltipModal,
    ModalWrapper: UseToolTipWrapper,
  } = useModal({
    onClose: () => {
      setIsFirst(false);
      localStorage.setItem(IS_FIRST, FALSE);
    },
    isCloseButtonExist: false,
  });
  const {
    openModal: openLoginAndStoreModal,
    closeModal: closeLoginAndStoreModal,
    ModalWrapper: LoginAndStoreModalWrapper,
  } = useModal();

  useEffect(() => {
    const storedIsFirst = localStorage.getItem(IS_FIRST);
    if (storedIsFirst === null) {
      setIsFirst(true);
    } else {
      setIsFirst(storedIsFirst.trim() === TRUE ? true : false);
    }
    if (isFirst) {
      openUseTooltipModal();
    }
  }, [isFirst, openUseTooltipModal]);

  return {
    isFirst,
    setIsFirst,
    IS_FIRST,
    TRUE,
    FALSE,
    openUseTooltipModal,
    closeUseTooltipModal,
    UseToolTipWrapper,
    openLoginAndStoreModal,
    closeLoginAndStoreModal,
    LoginAndStoreModalWrapper,
  };
}
