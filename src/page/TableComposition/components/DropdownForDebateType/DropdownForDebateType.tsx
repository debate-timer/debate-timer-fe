import { useState } from 'react';
import { Type } from '../../../../type/type';

interface DropdownForDebateTypeProps {
  type: Type;
  onChange: (agenda: Type) => void;
}

export default function DropdownForDebateType(
  props: DropdownForDebateTypeProps,
) {
  const { type, onChange } = props;
  const agendas: Type[] = ['의회식 토론', '시간 총량제 토론'];

  // 열림/닫힘만 로컬 state
  const [isToggleOpen, setIsToggleOpen] = useState(false);

  const handleTypeSelect = (type: Type) => {
    onChange(type); // 상위에 보고
    setIsToggleOpen(false);
  };

  // 선택되지 않은 항목만 보여주기
  const getAlternativeOption = agendas.filter((it) => it !== type);

  return (
    <div className="relative w-8/12">
      <button
        onClick={() => setIsToggleOpen(!isToggleOpen)}
        className="w-full rounded-md bg-neutral-300 p-6 text-center font-semibold text-white lg:text-3xl"
      >
        ▼ {type}
      </button>

      {isToggleOpen && (
        <ul
          className="absolute left-0 right-0 mt-2 rounded-md bg-neutral-200 shadow-lg"
          role="listbox"
        >
          {getAlternativeOption.map((it) => (
            <li
              key={it}
              onClick={() => handleTypeSelect(it)}
              role="option"
              tabIndex={0}
              className="cursor-pointer p-2 text-center font-semibold text-white hover:bg-neutral-400 focus:bg-neutral-400 focus:outline-none"
            >
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
