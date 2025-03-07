import { useState } from 'react';
import { Type } from '../../../../type/type';
import { typeMapping } from '../../../../constants/languageMapping';
import { IoMdArrowDropdown } from 'react-icons/io';

interface DropdownForDebateTypeProps {
  type: Type;
  onChange: (type: Type) => void;
}

export default function DropdownForDebateType(
  props: DropdownForDebateTypeProps,
) {
  const { type, onChange } = props;

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
    <div className="relative w-full">
      <button
        onClick={() => setIsToggleOpen(!isToggleOpen)}
        className="flex w-full items-center justify-between rounded-md border border-neutral-300 bg-white p-3 text-sm text-black focus:outline-none md:text-base"
      >
        <span>{typeMapping[type]}</span>
        <IoMdArrowDropdown
          className={`ml-2 text-xl transition-transform ${
            isToggleOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isToggleOpen && getAlternativeOptions.length !== 0 && (
        <ul
          className="absolute left-0 right-0 mt-1 rounded-md border border-neutral-300 bg-white shadow-md"
          role="listbox"
        >
          {getAlternativeOptions.map((koreanType) => (
            <li
              key={koreanType}
              onClick={() => handleTypeSelect(koreanType)}
              role="option"
              tabIndex={0}
              className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none md:text-base"
            >
              {koreanType}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
