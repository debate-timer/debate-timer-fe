import { useState } from 'react';

export default function DropdownForDebateType() {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('의회식 토론 (디폴트)');

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setIsToggleOpen(false);
  };

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
        ▼ {selectedType}
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
