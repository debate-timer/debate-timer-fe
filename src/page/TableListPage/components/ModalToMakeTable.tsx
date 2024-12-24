import { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalToMakeTable({ isOpen, onClose }: ModalProps) {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('의회식 토론 (디폴트)');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setIsToggleOpen(false);
  };

  // 현재 선택된 값의 반대 옵션을 반환하는 함수
  const getAlternativeOption = () => {
    return selectedType === '의회식 토론 (디폴트)'
      ? '시간 총량제 토론'
      : '의회식 토론 (디폴트)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex h-[800px] w-[1200px] flex-col bg-white">
        <div className="flex h-[100px] items-center justify-center bg-neutral-300 text-5xl font-semibold">
          <h1>어떤 토론을 원하시나요?</h1>
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-4xl font-semibold hover:scale-110"
          >
            X
          </button>
        </div>
        <section className="flex flex-1 flex-col justify-center gap-14 p-6">
          <div className="flex items-center justify-center gap-4">
            <h1 className="w-[400px] text-5xl font-bold">토론 시간표 이름</h1>
            <input
              placeholder="시간표#1(디폴트 값)"
              className="w-[600px] rounded-md bg-neutral-300 p-6 text-center text-3xl font-semibold text-white placeholder-white"
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <h1 className="w-[400px] text-5xl font-bold">토론 유형</h1>
            <div className="relative">
              <button
                onClick={() => setIsToggleOpen(!isToggleOpen)}
                className="w-[600px] rounded-md bg-neutral-300 p-6 text-center text-3xl font-semibold text-white"
              >
                ▼ &nbsp; &nbsp; {selectedType}
              </button>
              {isToggleOpen && (
                <div
                  onClick={() => handleTypeSelect(getAlternativeOption())}
                  className="absolute left-0 right-0 top-full mt-2 cursor-pointer rounded-md bg-neutral-300 p-4 text-center text-3xl font-semibold text-white hover:bg-neutral-400"
                >
                  {getAlternativeOption()}
                </div>
              )}
            </div>
          </div>
        </section>
        <button className="h-[80px] w-full bg-red-200 text-4xl font-semibold transition duration-300 hover:bg-red-300">
          테이블 만들기
        </button>
      </div>
    </div>
  );
}
