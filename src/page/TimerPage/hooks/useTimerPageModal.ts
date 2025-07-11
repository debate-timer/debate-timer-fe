// hooks/useTimerPageModal.ts
import { useEffect } from 'react';
import { useModal } from '../../../hooks/useModal';
import { useNavigate } from 'react-router-dom';
import { isGuestFlow } from '../../../util/sessionStorage';

export function useTimerPageModal(tableId: number) {
  const navigate = useNavigate();
  const IS_VISITED = 'isVisited';
  const TRUE = 'true';

  // 툴팁(처음 사용 안내) 모달
  const {
    openModal: openUseTooltipModal,
    closeModal: closeUseTooltipModal,
    ModalWrapper: UseToolTipWrapper,
    isOpen: isUseTooltipOpen,
  } = useModal({
    onClose: () => {
      localStorage.setItem(IS_VISITED, TRUE);
    },
    isCloseButtonExist: false,
  });

  // 로그인/저장 유도 모달
  const {
    openModal: openLoginAndStoreModal,
    closeModal: closeLoginAndStoreModal,
    ModalWrapper: LoginAndStoreModalWrapper,
    isOpen: isLoginAndStoreOpen,
  } = useModal();

  useEffect(() => {
    const isVisited = localStorage.getItem(IS_VISITED);
    if (isVisited === null || isVisited !== TRUE) {
      openUseTooltipModal();
    }
    // eslint-disable-next-line
  }, []);

  const openLoginAndStoreModalOrGoToOverviewPage = () => {
    if (isGuestFlow()) {
      openLoginAndStoreModal();
    } else {
      navigate(`/overview/customize/${tableId}`);
    }
  };

  return {
    isUseTooltipOpen,
    isLoginAndStoreOpen,
    UseToolTipWrapper,
    LoginAndStoreModalWrapper,
    openUseTooltipModal,
    closeUseTooltipModal,
    openLoginAndStoreModal,
    closeLoginAndStoreModal,
    openLoginAndStoreModalOrGoToOverviewPage,
  };
}
