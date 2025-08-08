import { useState, useRef, useEffect } from 'react';
import DTExpand from '../icons/Expand';
import clsx from 'clsx';

export interface DropdownMenuItem<T> {
  value: T;
  label: string;
}

interface DropdownMenuProps<T> {
  options: DropdownMenuItem<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function DropdownMenu<T>({
  options,
  selectedValue,
  onSelect,
  placeholder = '선택',
  disabled,
  className = '',
}: DropdownMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptionLabel =
    options.find((option) => option.value === selectedValue)?.label ||
    placeholder;

  // 드롭다운 외부 클릭 시 닫히도록 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleOptionClick = (value: T) => {
    onSelect(value);
    setIsOpen(false);
  };

  const buttonClasses = clsx(
    'relative flex min-h-[48px] w-full items-center justify-between rounded-md border bg-default-white px-4 py-2 text-left transition-all duration-200 ease-in-out',
    'focus:outline-none',
    {
      'border-default-disabled/hover text-default-disabled/hover cursor-not-allowed':
        disabled,
      'border-semantic-material ring-semantic-material/30 ring-4':
        isOpen && !disabled,
      'border-default-border text-default-black hover:bg-default-disabled/hover':
        !disabled,
    },
  );

  const menuClasses = clsx(
    'absolute z-10 mt-1 w-full overflow-hidden rounded-lg bg-default-white shadow-lg transition-all duration-200 ease-out',
    {
      'max-h-60 opacity-100 transform scale-y-100 origin-top': isOpen,
      'max-h-0 opacity-0 transform scale-y-95 origin-top pointer-events-none':
        !isOpen,
    },
  );

  const optionItemClasses = (optionValue: T) =>
    clsx(
      'cursor-pointer px-4 py-2 text-default-black transition-colors duration-150 ',
      'hover:bg-default-disabled/hover',
      {
        'bg-semantic-material/30 font-bold': optionValue === selectedValue,
      },
    );

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        className={buttonClasses}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="truncate">{selectedOptionLabel}</span>
        <DTExpand
          className={clsx(
            'ms-[16px] w-[12px] transition-transform duration-200',
            {
              'rotate-180': isOpen,
            },
          )}
        />
      </button>

      <div className={menuClasses} role="listbox">
        {options.map((option) => (
          <div
            key={`${option.value}`}
            className={optionItemClasses(option.value)}
            onClick={() => handleOptionClick(option.value)}
            role="option"
            aria-selected={option.value === selectedValue}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
