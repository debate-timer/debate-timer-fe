import { useState, useEffect } from 'react';
import Cointoss from '../../assets/teamSelection/cointoss.png';
import CoinFront from '../../assets/teamSelection/coinfront.png';
import CoinBack from '../../assets/teamSelection/coinback.png';
import { useModal } from '../../../../hooks/useModal';
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
  // 효과음 객체
  const coinTossSound = new Audio('/sounds/cointoss.mp3');
  const coinResultSound = new Audio('/sounds/cointoss-result.mp3');

  const {
    isOpen: modalIsOpen,
    openModal,
    closeModal,
    ModalWrapper,
  } = useModal({
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
      // 모달이 열리면 동전 던지기 화면, 동전 던지기 효과음 실행
      setCoinState('tossing');
      coinTossSound.play();

      // 3초 후 결과 표시
      const timer = setTimeout(() => {
        const result = Math.random() < 0.5 ? 'front' : 'back';
        setCoinState(result);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [modalIsOpen]);

  // 동전 던지기 결과가 나오면 결과 효과음 실행
  useEffect(() => {
    if (coinState === 'front' || coinState === 'back') {
      coinResultSound.play();
    }
  }, [coinState]);

  const handleStartDebate = () => {
    closeModal();
    onStartDebate();
  };

  return (
    <ModalWrapper closeButtonColor="text-natural-1000">
      <div
        className="sm:h-[350px] sm:w-[350px] relative flex h-[280px] w-[280px] flex-col overflow-hidden md:h-[400px] md:w-[400px] lg:h-[452px] lg:w-[452px]"
        style={{
          background: 'linear-gradient(180deg, #D1E5E9 0%, #FFF5D0 100%)',
        }}
      >
        <div className="flex flex-grow flex-col items-center justify-center">
          {coinState === 'tossing' ? (
            <>
              <div className="sm:w-[185px] sm:h-[280px] flex h-[250px] w-[150px] flex-col items-center justify-center md:h-[320px] md:w-[210px] lg:h-[300px] lg:w-[240px]">
                <div className="sm:h-36 sm:w-32 flex h-32 w-28 items-center justify-center md:h-40 md:w-36 lg:h-[240px] lg:w-[220px]">
                  <img
                    src={Cointoss}
                    alt="동전"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="flex h-20 w-full items-center justify-center px-6">
                <span className="text-natural-1000 sm:text-xl text-lg font-semibold md:text-2xl">
                  코인 던지는중..
                </span>
              </div>
            </>
          ) : (
            <div className="sm:w-[185px] sm:h-[280px] flex h-[250px] w-[150px] flex-col items-center justify-center md:h-[320px] md:w-[210px] lg:h-[300px] lg:w-[240px]">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="sm:h-32 sm:w-32 flex h-28 w-28 items-center justify-center md:h-36 md:w-36 lg:h-[220px] lg:w-[220px]">
                  <img
                    src={coinState === 'front' ? CoinFront : CoinBack}
                    alt="동전"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="sm:px-6 sm:py-4 rounded-full bg-black px-4 py-3 text-lg font-semibold text-white md:px-8 md:text-2xl">
                  {coinState === 'front' ? '앞' : '뒤'}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* 모달의 콘텐츠 영역과 분리하기 위해 별도 작성 */}
        {coinState !== 'tossing' && (
          <button
            className="sm:py-5 sm:text-lg w-full bg-brand-main py-4 text-base font-semibold md:py-6 md:text-xl lg:py-[27px] lg:text-[22px]"
            onClick={handleStartDebate}
          >
            토론 바로 시작하기
          </button>
        )}
      </div>
    </ModalWrapper>
  );
}
