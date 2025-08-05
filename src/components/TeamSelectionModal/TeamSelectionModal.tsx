import  { useState, useEffect } from 'react';
import { useModal } from '../../hooks/useModal';
import Cointoss from '../../assets/teamSelection/cointoss.png';
import CoinFront from '../../assets/teamSelection/coinfront.png';
import CoinBack from '../../assets/teamSelection/coinback.png';

interface TeamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDebate: () => void;
}

type CoinState = 'tossing' | 'front' | 'back';

export default function TeamSelectionModal({
  isOpen,
  onClose,
  onStartDebate,
}: TeamSelectionModalProps) {
  const [coinState, setCoinState] = useState<CoinState>('tossing');
  const [showResult, setShowResult] = useState(false);
  
  const { isOpen: modalIsOpen, openModal, closeModal, ModalWrapper } = useModal({
    closeOnOverlayClick: true,
    isCloseButtonExist: true,
    onClose,
  });

  // 외부에서 전달받은 isOpen 상태를 모달 훅과 동기화
  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  useEffect(() => {
    if (modalIsOpen) {
      // 모달이 열리면 동전 던지기 시작
      setCoinState('tossing');
      setShowResult(false);
      
      // 3초 후 결과 표시
      const timer = setTimeout(() => {
        const result = Math.random() < 0.5 ? 'front' : 'back';
        setCoinState(result);
        setShowResult(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [modalIsOpen]);

  const handleStartDebate = () => {
    closeModal();
    onStartDebate();
  };

  return (
    <ModalWrapper closeButtonColor="text-natural-1000">
      <div
        className="relative flex h-[280px] w-[280px] flex-col overflow-hidden sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px] lg:h-[452px] lg:w-[452px]"
        style={{
          background: 'linear-gradient(180deg, #D1E5E9 0%, #FFF5D0 100%)',
        }}
      >
        <div className="flex flex-grow flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-[150px] h-[250px] sm:w-[185px] sm:h-[280px] md:w-[210px] md:h-[320px] lg:w-[240px] lg:h-[300px]">
            {/* 동전 던지는 중이면 Cointoss 이미지, 끝났다면 앞 또는 뒤의 이미지 + 앞 또는 뒤 뱃지 */}
            {coinState === 'tossing' ? (
              <div className="flex items-center justify-center h-32 w-28 sm:h-36 sm:w-32 md:h-40 md:w-36 lg:h-[240px] lg:w-[220px]">
                <img
                  src={Cointoss}
                  alt="동전"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-[220px] lg:w-[220px]">
                  <img
                    src={coinState === 'front' ? CoinFront : CoinBack}
                    alt="동전"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="rounded-full bg-black px-4 py-3 text-lg font-semibold text-white sm:px-6 sm:py-4 md:px-8 md:text-2xl">
                  {coinState === 'front' ? '앞' : '뒤'}
                </div>
              </div>
            )}
          </div>
          {!showResult && (
            <div className="flex h-20 w-full items-center justify-center px-6">
              <span className="text-lg font-semibold text-natural-1000 sm:text-xl md:text-2xl">
                코인 던지는중..
              </span>
            </div>
          )}
        </div>
        {showResult && (
          <button
            className="w-full bg-brand-main py-4 font-semibold sm:py-5 md:py-6 lg:py-[27px] text-base sm:text-lg md:text-xl lg:text-[22px]"
            onClick={handleStartDebate}
          >
            토론 바로 시작하기
          </button>
        )}
      </div>
    </ModalWrapper>
  );
} 