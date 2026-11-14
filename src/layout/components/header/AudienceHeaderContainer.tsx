import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import useLoginPrompt from '../../../hooks/useLoginPrompt';
import LoginPrompt from '../../../components/LoginPrompt/LoginPrompt';
import AudienceHeader from './AudienceHeader';
import LanguageSelector from './LanguageSelector';

interface AudienceHeaderContainerProps {
  name?: string | null;
  agenda?: string | null;
}

/** 공개 청중 페이지의 현재 목적지·언어·로그인 조작을 연결함. */
export default function AudienceHeaderContainer(
  props: AudienceHeaderContainerProps,
) {
  const { t } = useTranslation();
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
              <button
                type="button"
                aria-label={t('로그인')}
                className="min-h-11 rounded-xl bg-brand px-4 text-ui-label"
                onClick={() =>
                  login.requestLogin(
                    `${location.pathname}${location.search}${location.hash}`,
                  )
                }
              >
                {t('로그인')}
              </button>
            )}
          </>
        }
      />
      <LoginPrompt login={login} />
    </>
  );
}
