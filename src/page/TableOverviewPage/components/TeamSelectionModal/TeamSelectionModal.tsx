import { useState, useEffect, useMemo } from 'react';
import Cointoss from '../../../../assets/teamSelection/cointoss.png';
import CoinFront from '../../../../assets/teamSelection/coinfront.png';
import CoinBack from '../../../../assets/teamSelection/coinback.png';

interface TeamSelectionModalProps {
  onClose: () => void;
  onStartDebate: () => void;
  onEdit: () => void;
}

type CoinState = 'initial' | 'tossing' | 'front' | 'back';

export default function TeamSelectionModal({
  onClose,
  onStartDebate,
  onEdit,
}: TeamSelectionModalProps) {
  const [coinState, setCoinState] = useState<CoinState>('initial');

  // 효과음 객체
  const coinTossSound = useMemo(() => new Audio('/sounds/cointoss.mp3'), []);
  const coinResultSound = useMemo(
    () => new Audio('/sounds/cointoss-result.mp3'),
    [],
  );

  // 동전 던지는 소리
  useEffect(() => {
    if (coinState === 'tossing') {
      coinTossSound.play();
      const timer = setTimeout(() => {
        // 다음 화면 상태 전환 직전에 사운드 명시적 정지
        coinTossSound.pause();
        coinTossSound.currentTime = 0;
        const result = Math.random() < 0.5 ? 'front' : 'back';
        setCoinState(result);
      }, 2000);
      return () => {
        clearTimeout(timer);
        coinTossSound.pause();
        coinTossSound.currentTime = 0;
      };
    }
  }, [coinState, coinTossSound]); // coinTossSound는 useMemo를 통해 딱 처음에 생성된 객체이기 때문에 currentTime = 0임을 보장한다.

  // 결과 소리
  useEffect(() => {
    if (coinState === 'front' || coinState === 'back') {
      coinResultSound.currentTime = 0;
      coinResultSound.play();
    }
    return () => {
      coinResultSound.pause();
      coinResultSound.currentTime = 0;
    };
  }, [coinState, coinResultSound]);

  const handleStart = () => {
    onClose();
    onStartDebate();
  };

  const handleEdit = () => {
    onClose();
    onEdit();
  };

  return (
    <div
      className="sm:h-[350px] sm:w-[350px] relative flex h-[280px] w-[280px] flex-col overflow-hidden md:h-[400px] md:w-[400px] lg:h-[452px] lg:w-[452px]"
      style={{
        background: 'linear-gradient(180deg, #D1E5E9 0%, #FFF5D0 100%)',
      }}
    >
      <div className="flex flex-grow flex-col items-center justify-center">
        {coinState === 'initial' && (
          <div className="mt-7 flex flex-col items-center justify-center p-8 text-center">
            <p className="sm:text-xl sm:leading-loose text-lg font-semibold leading-7 md:text-2xl md:leading-9 lg:text-3xl lg:leading-[45px] xl:text-[34px] xl:leading-[50px]">
              팀별로 <br /> 동전의 앞 / 뒷면 중 <br /> 하나를 선택해 주세요.
            </p>
          </div>
        )}

        {coinState === 'tossing' && (
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
                동전 던지는 중...
              </span>
            </div>
          </>
        )}

        {(coinState === 'front' || coinState === 'back') && (
          <div className="sm:w-[185px] sm:h-[280px] flex h-[250px] w-[150px] flex-col items-center justify-center md:h-[320px] md:w-[210px] lg:h-[300px] lg:w-[240px]">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="sm:h-32 sm:w-32 flex h-28 w-28 items-center justify-center md:h-36 md:w-36 lg:h-[220px] lg:w-[220px]">
                <img
                  src={coinState === 'front' ? CoinFront : CoinBack}
                  alt="동전"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="sm:px-3 sm:py-1 sm:text-lg rounded-full bg-black px-2 py-0.5 text-base font-semibold text-white md:px-4 md:py-1.5 md:text-xl lg:px-4 lg:py-1.5 lg:text-2xl xl:px-5 xl:py-2">
                {coinState === 'front' ? '앞' : '뒤'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 모달의 콘텐츠 영역과 분리하기 위해 별도 작성 */}
      <div className="w-full">
        {coinState === 'initial' && (
          <button
            className="sm:text-lg sm:py-4 w-full bg-brand py-3 text-[22px] font-semibold hover:bg-brand-hover md:py-5 md:text-xl lg:py-[21px] lg:text-[22px]"
            onClick={() => setCoinState('tossing')}
          >
            동전 던지기
          </button>
        )}
        {(coinState === 'front' || coinState === 'back') && (
          <div className="flex">
            <button
              className="sm:text-lg sm:py-4 w-full border-[2px] border-default-disabled/hover py-3 text-lg font-semibold hover:bg-default-disabled/hover md:py-5 md:text-xl lg:py-[21px] lg:text-[22px]"
              onClick={handleEdit}
            >
              토론 정보 수정하기
            </button>
            <button
              className="sm:text-lg sm:py-4 w-full bg-brand py-3 text-lg font-bold hover:bg-brand-hover md:py-5 md:text-xl lg:py-[21px] lg:text-[22px]"
              onClick={handleStart}
            >
              토론 바로 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
