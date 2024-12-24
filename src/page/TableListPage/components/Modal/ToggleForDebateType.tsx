import { useState } from 'react';

export default function ToggleForDebateType() {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('의회식 토론 (디폴트)');

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
  );
}
