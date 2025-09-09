import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePostUser } from '../../hooks/mutations/usePostUser';
import {
  deleteSessionCustomizeTableData,
  isGuestFlow,
} from '../../util/sessionStorage';

export default function OAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedLogin = useRef(false);

  const { mutate } = usePostUser(() => {
    const keepGuestTable = sessionStorage.getItem('keepGuestTable');

    if (keepGuestTable === 'false') {
      deleteSessionCustomizeTableData();
    }

    sessionStorage.removeItem('keepGuestTable');

    if (isGuestFlow()) {
      navigate('/share');
    } else {
      navigate('/');
    }
  });

  useEffect(() => {
    if (hasProcessedLogin.current === true) {
      return;
    }

    const loginOAuth = async () => {
      const code = searchParams.get('code');
      if (code === null) {
        return;
      }
      mutate(code);
    };

    loginOAuth();

    return () => {
      hasProcessedLogin.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
