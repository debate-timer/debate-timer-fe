import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { isLoggedIn } from '../../../util/accessToken';
import LanguageSelector from '../../../layout/components/header/LanguageSelector';

interface HeaderProps {
  onLoginButtonClicked: () => void;
}

export default function Header({ onLoginButtonClicked }: HeaderProps) {
  const { t } = useTranslation();
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
        <p className="flex items-center text-body-raw font-semibold md:text-subtitle-raw">
          Debate Timer
        </p>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <button
            className="text-body-raw font-semibold md:text-subtitle-raw"
            onClick={onLoginButtonClicked}
          >
            {!isLoggedIn() ? t('3초 로그인') : t('로그아웃')}
          </button>
        </div>
      </div>
    </header>
  );
}
