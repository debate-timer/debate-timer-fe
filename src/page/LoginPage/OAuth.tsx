import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePostUser } from '../../hooks/mutations/usePostUser';

export default function OAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate } = usePostUser(() => {
    navigate('/');
  });
  useEffect(() => {
    const loginOAuth = async () => {
      const code = searchParams.get('code');
      if (code === null) {
        return;
      }
      mutate(code);
    };

    loginOAuth();
  }, [navigate, searchParams, mutate]);
  return null;
}
