import { useCallback, useEffect } from 'react';
import { getAccessToken } from '../util/accessToken';
import { useNavigate } from 'react-router-dom';

export default function BackActionHandler() {
  const navigate = useNavigate();
  const handleBackAction = useCallback(() => {
    if (getAccessToken() !== null && window.location.pathname === '/') {
      // Push the current state again to prevent going back
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const onPopState = () => {
      handleBackAction();
    };

    // Listen for the popstate event to handle the back action
    window.addEventListener('popstate', onPopState);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [handleBackAction]);

  return <></>;
}
