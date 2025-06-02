import { useState, useEffect } from 'react';

interface HeaderProps {
  onLogin: () => void;
}

export default function Header({ onLogin }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-20 flex w-full items-center justify-center bg-white py-2 transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="flex w-[70%] items-center justify-between">
        <div className="flex items-center text-[2vw] font-semibold">
          Debate Timer
        </div>
        <button className="text-[1.25vw]" onClick={onLogin}>
          3초 로그인
        </button>
      </div>
    </header>
  );
}
