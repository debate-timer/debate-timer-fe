import { MouseEvent, useEffect } from 'react';
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

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
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="transcript-leave-title"
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
              <p className="text-ui-body text-neutral-600">
                {t(
                  '지금 나가면 지금까지 기록된 토론 속기록이 사라져요. 그래도 나가시겠어요?',
                )}
              </p>
            </div>
          </DialogModal>
        </div>
      </div>
    </GlobalPortal.Consumer>
  );
}
