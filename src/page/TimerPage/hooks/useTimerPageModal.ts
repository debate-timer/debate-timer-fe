// hooks/useTimerPageModal.ts
import { useEffect, useRef, useState } from 'react';
import { useModal } from '../../../hooks/useModal';
import { useNavigate } from 'react-router-dom';
import { isGuestFlow } from '../../../util/sessionStorage';
import { useTranslation } from 'react-i18next';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';

export function useTimerPageModal(tableId: number) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const IS_VISITED = 'isVisited';
  const TRUE = 'true';
  const [isAnswerTimeGuideOpen, setIsAnswerTimeGuideOpen] = useState(false);
  const hasOpenedAnswerTimeGuideRef = useRef(false);

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

  const openAnswerTimeGuide = () => {
    if (hasOpenedAnswerTimeGuideRef.current) return;

    hasOpenedAnswerTimeGuideRef.current = true;
    setIsAnswerTimeGuideOpen(true);
  };

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
      return;
    }
    openAnswerTimeGuide();
    // eslint-disable-next-line
  }, []);

  const closeUseTooltipModalAndOpenAnswerTimeGuide = () => {
    closeUseTooltipModal();
    openAnswerTimeGuide();
  };

  const closeAnswerTimeGuide = () => {
    setIsAnswerTimeGuideOpen(false);
  };

  const openLoginAndStoreModalOrGoToDebateEndPage = () => {
    if (isGuestFlow()) {
      openLoginAndStoreModal();
    } else {
      navigate(buildLangPath(`/table/customize/${tableId}/end`, lang));
    }
  };

  return {
    isUseTooltipOpen,
    isAnswerTimeGuideOpen,
    isLoginAndStoreOpen,
    UseToolTipWrapper,
    LoginAndStoreModalWrapper,
    openUseTooltipModal,
    closeUseTooltipModal: closeUseTooltipModalAndOpenAnswerTimeGuide,
    closeAnswerTimeGuideModal: closeAnswerTimeGuide,
    openLoginAndStoreModal,
    closeLoginAndStoreModal,
    openLoginAndStoreModalOrGoToDebateEndPage,
  };
}
