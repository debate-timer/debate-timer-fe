import { useLocation } from 'react-router-dom';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import useLoginPrompt from '../../../hooks/useLoginPrompt';
import LoginPrompt from '../../../components/LoginPrompt/LoginPrompt';
import AudienceHeader from './AudienceHeader';
import HeaderLoginButton from './HeaderLoginButton';
import LanguageSelector from './LanguageSelector';

interface AudienceHeaderContainerProps {
  name?: string | null;
  agenda?: string | null;
}

/** 공개 청중 페이지의 현재 목적지·언어·로그인 조작을 연결함. */
export default function AudienceHeaderContainer(
  props: AudienceHeaderContainerProps,
) {
  const { memberId } = useGlobalSettings();
  const location = useLocation();
  const login = useLoginPrompt();
  return (
    <>
      <AudienceHeader
        {...props}
        actions={
          <>
            <LanguageSelector />
            {!memberId && (
              <HeaderLoginButton
                onClick={() =>
                  login.requestLogin(
                    `${location.pathname}${location.search}${location.hash}`,
                  )
                }
              />
            )}
          </>
        }
      />
      <LoginPrompt login={login} />
    </>
  );
}
