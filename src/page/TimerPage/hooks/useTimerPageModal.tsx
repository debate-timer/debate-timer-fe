import { useEffect } from 'react';
import { useModal } from '../../../hooks/useModal';
import FirstUseToolTip from '../components/FirstUseToolTip';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { oAuthLogin } from '../../../util/googleAuth';
import { isGuestFlow } from '../../../util/sessionStorage';
import { useNavigate } from 'react-router-dom';

/**
 * 타이머 페이지 내에서
 * - 첫 방문 사용자에게 툴팁 모달(사용법 안내)
 * - 비로그인 사용자에게 데이터 저장/로그인 유도 모달
 * 을 관리하는 커스텀 훅입니다.
 */
export default function useTimerPageModal(tableId: number) {
  const navigate = useNavigate();
  // 로컬스토리지 키 및 값 정의
  const IS_VISITED = 'isVisited';
  const TRUE = 'true';

  // 툴팁(처음 사용 안내) 모달
  const {
    openModal: openUseTooltipModal,
    closeModal: closeUseTooltipModal,
    ModalWrapper: UseToolTipWrapper,
  } = useModal({
    // 모달 닫을 때, "처음 아님" 처리 및 localStorage 동기화
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
  } = useModal();

  /**
   * 페이지 진입 시 "처음 방문" 여부 체크
   * - 첫 방문이면 툴팁 모달 자동 오픈
   * - 아니면 무시
   */
  // 최초 진입 시 "처음 방문"이면 자동 모달 오픈
  useEffect(() => {
    const isVisited = localStorage.getItem(IS_VISITED);
    if (isVisited === null || isVisited !== TRUE) {
      openUseTooltipModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLoginAndStoreModalOrGoToOverviewPage = () => {
    if (isGuestFlow()) {
      openLoginAndStoreModal();
    } else {
      navigate(`/overview/customize/${tableId}`);
    }
  };

  const FirstUseToolTipModal = () => {
    return (
      <UseToolTipWrapper>
        <FirstUseToolTip
          onClose={() => {
            closeUseTooltipModal();
          }}
        />
      </UseToolTipWrapper>
    );
  };

  const LoginAndStoreModal = () => {
    return (
      <LoginAndStoreModalWrapper closeButtonColor="text-neutral-1000">
        <DialogModal
          left={{
            text: '아니오',
            onClick: () => {
              closeLoginAndStoreModal();
            },
          }}
          right={{
            text: '네',
            onClick: () => {
              closeLoginAndStoreModal();
              oAuthLogin();
            },
            isBold: true,
          }}
        >
          <div className="break-keep px-20 py-10 text-center text-xl font-bold">
            토론을 끝내셨군요! <br />
            지금까지의 시간표를 로그인하고 저장할까요?
          </div>
        </DialogModal>
      </LoginAndStoreModalWrapper>
    );
  };

  return {
    openUseTooltipModal,
    openLoginAndStoreModal,
    FirstUseToolTipModal,
    LoginAndStoreModal,
    openLoginAndStoreModalOrGoToOverviewPage,
  };
}
