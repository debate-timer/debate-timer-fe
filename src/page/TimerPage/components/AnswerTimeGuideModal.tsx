import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface AnswerTimeGuideModalProps {
  onClose: () => void;
}

export default function AnswerTimeGuideModal({
  onClose,
}: AnswerTimeGuideModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div
      className="fixed left-1/2 top-[240px] z-40 flex h-[90px] w-[520px] -translate-x-1/2 items-center justify-center rounded-[8px] bg-[#FECD4C]/[0.62] px-[22px] text-center text-[22px] font-bold leading-[1.35] text-default-black shadow-[0_3px_8px_rgba(0,0,0,0.24)]"
      data-testid="answer-time-guide-modal"
    >
      <p className="whitespace-pre-line">
        {t(
          'Shift 키 또는 답변 타이머 버튼을 눌러\n[시작 → 정지 → 초기화] 할 수 있어요',
        )}
      </p>
    </div>
  );
}
