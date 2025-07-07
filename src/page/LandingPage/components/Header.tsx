import { useState, useEffect } from 'react';
import { isLoggedIn } from '../../../util/accessToken';

interface HeaderProps {
  onLoginButtonClicked: () => void;
}

export default function Header({ onLoginButtonClicked }: HeaderProps) {
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
      <div className="flex w-[90%] max-w-[1226px] items-center justify-between md:w-[70%]">
        <div className="flex items-center text-[min(max(1.25rem,2vw),2rem)] font-semibold">
          Debate Timer
        </div>
        <button
          className="text-[min(max(0.875rem,1.25vw),1.2rem)]"
          onClick={onLoginButtonClicked}
        >
          {!isLoggedIn() ? '3초 로그인' : '로그아웃'}
        </button>
      </div>
    </header>
  );
}
