import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { GlobalPortal } from '../util/GlobalPortal';
import ModalFrame, {
  ModalWrapperProps,
} from '../components/ModalFrame/ModalFrame';

interface UseModalOptions {
  closeOnOverlayClick?: boolean;
  isCloseButtonExist?: boolean;
  onClose?: () => void;
}
function noop() {}

/**
 * 열림 상태와 닫기를 제공하며 포털 내부의 모달이 포커스 수명을 소유함.
 *
 * `useModal`의 `ModalWrapper`는 X 닫기 버튼을 본문 앞의 독립 영역에 표시함. 훅의 `isCloseButtonExist`가 기본 표시 여부를 정하고, 창별 `showCloseButton`이 있으면 이를 우선함. 하단에 취소 수단이 충분한 확인창은 X를 생략하고 공유·조회 창이나 양쪽 버튼이 각각 작업을 실행하는 선택 창은 유지함. 결과 공개 확인과 상세 결과처럼 한 모달의 단계별 요구가 다르면 `showCloseButton`으로 구분함. 닫기 버튼 색상은 공통 중립색을 사용하며 색상 지정 prop을 제공하지 않음. Wrapper의 `aria-label`·`aria-labelledby`·`aria-describedby`로 창의 이름·설명을 연결하며 이름 생략 시 번역된 일반 이름을 제공함. `hasDialogContent`는 UpdateModal처럼 자식이 역할·이름을 제공할 때만 사용해 중첩 역할을 피함. 열린 창은 초기 포커스·Tab 순환·외부 포커스 진입 차단·닫힘 시 복귀를 처리함. Escape와 배경 클릭은 최상위 useModal 창에만 적용하며 닫힌 훅에는 키보드 이벤트를 등록하지 않음. 다른 구현의 모달과 공유하는 전역 중첩 관리는 포함하지 않음.
 *
 */
export function useModal(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    closeOnOverlayClick = true,
    isCloseButtonExist = true,
    onClose = noop,
  } = options;
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    onCloseRef.current();
    setIsOpen(false);
  }, []);

  const ModalWrapper = useCallback(
    function ModalWrapper(props: ModalWrapperProps) {
      if (!isOpen) {
        return null;
      }
      return (
        <GlobalPortal.Consumer>
          <ModalFrame
            {...props}
            showCloseButton={props.showCloseButton ?? isCloseButtonExist}
            onClose={closeModal}
            closeOnOverlayClick={closeOnOverlayClick}
          />
        </GlobalPortal.Consumer>
      );
    },
    [closeModal, closeOnOverlayClick, isCloseButtonExist, isOpen],
  );
  return { isOpen, openModal, closeModal, ModalWrapper };
}
