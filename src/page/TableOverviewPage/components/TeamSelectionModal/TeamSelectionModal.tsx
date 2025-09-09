import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Cointoss from '../../../../assets/teamSelection/cointoss.png';
import CoinFront from '../../../../assets/teamSelection/coinfront.png';
import CoinBack from '../../../../assets/teamSelection/coinback.png';
import { CoinState } from '../../../../type/type';

interface TeamSelectionModalProps {
  onClose: () => void;
  onStartDebate: () => void;
  onEdit: () => void;
  initialCoinState: CoinState;
  onCoinStateChange: (state: CoinState) => void;
}

export default function TeamSelectionModal({
  onClose,
  onStartDebate,
  onEdit,
  initialCoinState,
  onCoinStateChange,
}: TeamSelectionModalProps) {
  const [coinState, setCoinState] = useState<CoinState>(initialCoinState);
  const hasResultSoundPlayedRef = useRef(false);

  const updateCoinState = useCallback(
    (newState: CoinState) => {
      setCoinState(newState);
      onCoinStateChange(newState);
    },
    [onCoinStateChange],
  );

  // 효과음 객체
  const coinTossSound = useMemo(() => new Audio('/sounds/cointoss.mp3'), []);
  const coinResultSound = useMemo(
    () => new Audio('/sounds/cointoss-result.mp3'),
    [],
  );

  // 동전 던지는 소리 및 결과 처리
  useEffect(() => {
    if (coinState === 'tossing') {
      // 동전 던질 때 false로 초기화
      hasResultSoundPlayedRef.current = false;

      coinTossSound.currentTime = 0;
      coinTossSound.play();

      const timer = setTimeout(() => {
        // 다음 화면 상태 전환 직전 사운드 명시적 정지
        coinTossSound.pause();
        coinTossSound.currentTime = 0;

        // 결과 결정 및 상태 업데이트
        const result = Math.random() < 0.5 ? 'front' : 'back';
        updateCoinState(result);

        // 결과 소리 바로 재생
        setTimeout(() => {
          if (!hasResultSoundPlayedRef.current) {
            coinResultSound.currentTime = 0;
            coinResultSound.play();
            hasResultSoundPlayedRef.current = true;
          }
        }, 100); // 약간의 딜레이로 자연스럽게 연결
      }, 2000);

      return () => {
        clearTimeout(timer);
        coinTossSound.pause();
        coinTossSound.currentTime = 0;
      };
    }
  }, [coinState, coinTossSound, coinResultSound, updateCoinState]);

  // 초기 상태에서 결과 상태로 직접 진입한 경우 (탭 전환 등)
  useEffect(() => {
    if (
      (coinState === 'front' || coinState === 'back') &&
      initialCoinState === coinState
    ) {
      // 초기값과 현재값이 같다면 이미 결과가 나온 상태이므로 소리 재생하지 않음
      hasResultSoundPlayedRef.current = true;
    }
  }, [coinState, initialCoinState]);

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
              <span className="text-neutral-1000 sm:text-xl text-lg font-semibold md:text-2xl">
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
            onClick={() => updateCoinState('tossing')}
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
