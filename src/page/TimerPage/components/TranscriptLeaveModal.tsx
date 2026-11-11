import { MouseEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { GlobalPortal } from '../../../util/GlobalPortal';

interface TranscriptLeaveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// 토론 기록 중 화면을 벗어나려 할 때 속기록 유실을 안내한다. 확인을 눌러야만 나간다.
export default function TranscriptLeaveModal(props: TranscriptLeaveModalProps) {
  const { isOpen, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  // 포털 컨테이너가 준비된 뒤 대화상자가 붙으므로 ref 대신 state로 받는다.
  const [dialogElement, setDialogElement] = useState<HTMLDivElement | null>(
    null,
  );

  // 열 때의 포커스를 기억했다가 닫히면 되돌린다.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      previousFocus?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    dialogElement?.querySelector('button')?.focus();
  }, [dialogElement]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }
      if (event.key !== 'Tab' || !dialogElement) {
        return;
      }
      // 배경의 타이머 조작으로 포커스가 빠지지 않도록 모달 버튼 안에서만 순환한다.
      const buttons = Array.from(dialogElement.querySelectorAll('button'));
      if (buttons.length === 0) {
        return;
      }
      event.preventDefault();
      const currentIndex = buttons.findIndex(
        (button) => button === document.activeElement,
      );
      const step = event.shiftKey ? -1 : 1;
      const nextIndex =
        currentIndex === -1
          ? 0
          : (currentIndex + step + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel, dialogElement]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <GlobalPortal.Consumer>
      <div
        data-testid="transcript-leave-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleOverlayClick}
      >
        <div
          ref={setDialogElement}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="transcript-leave-title"
          aria-describedby="transcript-leave-description"
          className="overflow-hidden rounded-[20px] bg-white shadow-lg"
        >
          <DialogModal
            left={{ text: t('취소'), onClick: onCancel }}
            right={{ text: t('확인'), isBold: true, onClick: onConfirm }}
          >
            <div className="flex flex-col gap-3 px-10 py-8 text-center">
              <p id="transcript-leave-title" className="text-ui-title">
                {t('토론 기록이 진행 중이에요')}
              </p>
              <p
                id="transcript-leave-description"
                className="text-ui-body whitespace-pre-line text-neutral-600"
              >
                {t('지금 나가면 토론 기록이 사라져요.\n그래도 나가시겠어요?')}
              </p>
            </div>
          </DialogModal>
        </div>
      </div>
    </GlobalPortal.Consumer>
  );
}
