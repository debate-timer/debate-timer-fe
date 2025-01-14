import { useState } from 'react';
import { Type } from '../../../../type/type';

interface DropdownForDebateTypeProps {
  type: Type;
  onChange: (type: Type) => void;
}

export default function DropdownForDebateType(
  props: DropdownForDebateTypeProps,
) {
  const { type, onChange } = props;

  const typeMapping: Record<string, string> = {
    parliamentary: '의회식 토론',
    timeBased: '시간 총량제 토론',
  };

  const reverseTypeMapping: Record<string, string> = Object.fromEntries(
    Object.entries(typeMapping).map(([key, value]) => [value, key]),
  );

  const koreanTypes = Object.values(typeMapping);

  const [isToggleOpen, setIsToggleOpen] = useState(false);

  const handleTypeSelect = (selectedKoreanType: string) => {
    const selectedEnglishType = reverseTypeMapping[selectedKoreanType];
    onChange(selectedEnglishType as Type);
    setIsToggleOpen(false);
  };

  const getAlternativeOptions = koreanTypes.filter(
    (koreanType) => reverseTypeMapping[koreanType] !== type,
  );

  return (
    <div className="relative w-8/12">
      <button
        onClick={() => setIsToggleOpen(!isToggleOpen)}
        className="w-full rounded-md bg-neutral-300 p-6 text-center font-semibold text-white lg:text-3xl"
      >
        ▼ {typeMapping[type]}
      </button>

      {isToggleOpen && (
        <ul
          className="absolute left-0 right-0 mt-2 rounded-md bg-neutral-200 shadow-lg"
          role="listbox"
        >
          {getAlternativeOptions.map((koreanType) => (
            <li
              key={koreanType}
              onClick={() => handleTypeSelect(koreanType)}
              role="option"
              tabIndex={0}
              className="cursor-pointer p-2 text-center font-semibold text-white hover:bg-neutral-400 focus:bg-neutral-400 focus:outline-none"
            >
              {koreanType}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
