import { useEffect, useState } from 'react';
import { useModal } from '../../../hooks/useModal';

/**
 * 타이머 페이지 내에서
 * - 첫 방문 사용자에게 툴팁 모달(사용법 안내)
 * - 비로그인 사용자에게 데이터 저장/로그인 유도 모달
 * 을 관리하는 커스텀 훅입니다.
 */
export default function useTimerPageModal() {
  // 첫 방문 여부 상태값
  const [isFirst, setIsFirst] = useState(false);
  // 로컬스토리지 키 및 값 정의
  const IS_FIRST = 'isFirst';
  const TRUE = 'true';
  const FALSE = 'false';

  // 툴팁(처음 사용 안내) 모달
  const {
    openModal: openUseTooltipModal,
    closeModal: closeUseTooltipModal,
    ModalWrapper: UseToolTipWrapper,
  } = useModal({
    // 모달 닫을 때, "처음 아님" 처리 및 localStorage 동기화
    onClose: () => {
      setIsFirst(false);
      localStorage.setItem(IS_FIRST, FALSE);
    },
    isCloseButtonExist: false,
  });

  // 로그인/저장 유도 모달
  const {
    openModal: openLoginAndStoreModal,
    closeModal: closeLoginAndStoreModal,
    ModalWrapper: LoginAndStoreModalWrapper,
  } = useModal();

  /**
   * 페이지 진입 시 "처음 방문" 여부 체크
   * - 첫 방문이면 툴팁 모달 자동 오픈
   * - 아니면 무시
   */
  useEffect(() => {
    const storedIsFirst = localStorage.getItem(IS_FIRST);
    if (storedIsFirst === null) {
      setIsFirst(true); // localStorage에 없으면 첫 방문
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
