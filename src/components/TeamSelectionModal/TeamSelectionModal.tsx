import React, { useState, useEffect } from 'react';
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
        className="p-6 w-full"
        style={{
          background: 'linear-gradient(180deg, #D1E5E9 0%, #FFF5D0 100%)'
        }}
      >
        <div className="flex flex-col items-center">
          {/* 동전 이미지 */}
          <div className="w-40 h-40 flex items-center justify-center mb-4">
            <img 
              src={
                coinState === 'tossing' ? Cointoss :
                coinState === 'front' ? CoinFront : CoinBack
              } 
              alt="동전" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* 상태 텍스트 */}
          {coinState === 'tossing' && (
            <span className="text-lg font-semibold text-gray-700 mb-6">
              코인 던지는 중...
            </span>
          )}
          
          {/* 결과 표시 */}
          {showResult && (
            <div className="w-full space-y-4">
              {/* 결과 배지 */}
              <div className="flex justify-center">
                <div className="bg-black text-white px-6 py-2 rounded-full text-lg font-semibold">
                  {coinState === 'front' ? '앞' : '뒤'}
                </div>
              </div>
              {/* 시작 버튼 */}
              <button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                onClick={handleStartDebate}
              >
                토론 바로 시작하기
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
} 