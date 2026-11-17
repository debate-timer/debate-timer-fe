import { INQUIRY_LINKS } from '../../../constants/urls';
import { useTranslation } from 'react-i18next';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import useFeatureFlag from '../../../hooks/useFeatureFlag';
import useLoginPrompt from '../../../hooks/useLoginPrompt';
import LoginPrompt from '../../../components/LoginPrompt/LoginPrompt';
import SettingsModal from '../../../components/SettingsModal/SettingsModal';
import LanguageSelector from './LanguageSelector';
import GeneralHeader from './GeneralHeader';
import HeaderLoginButton from './HeaderLoginButton';
import { HEADER_ICON_BUTTON_CLASS } from './headerActionStyles';
import {
  deleteSessionCustomizeTableData,
  isGuestFlow,
} from '../../../util/sessionStorage';

/** 일반 헤더의 설정·권한·탐색을 연결함. Google 로그인 버튼은 확인창 없이 OAuth를 시작하며 보호 경로 진입은 기존 확인창을 유지함. */
export default function GeneralHeaderContainer() {
  const { t } = useTranslation();
  const { memberId } = useGlobalSettings();
  const isMember = memberId !== null;
  const { isEnabled } = useFeatureFlag('TRANSCRIPT', { enabled: isMember });
  const login = useLoginPrompt();
  const handleIntroduction = () => {
    try {
      if (isGuestFlow()) {
        deleteSessionCustomizeTableData();
      }
    } catch {
      // 브라우저 저장소 오류가 소개로의 이동을 차단하지 않음.
    }
  };
  return (
    <>
      <GeneralHeader
        isMember={isMember}
        canViewRecords={isEnabled}
        onRequireLogin={login.requestLogin}
        onIntroduction={handleIntroduction}
        inquiries={INQUIRY_LINKS}
        actions={
          <>
            <LanguageSelector />
            <SettingsModal
              triggerClassName={HEADER_ICON_BUTTON_CLASS}
              onLogin={() => login.requestLogin()}
            />
            {!isMember && (
              <HeaderLoginButton
                label={t('Google로 로그인')}
                onClick={login.startDirect}
              />
            )}
          </>
        }
      />
      {login.hasError && !login.isOpen && (
        <p role="alert" className="px-4 py-2 text-ui-caption text-red-700">
          {t('로그인을 시작하지 못했습니다. 다시 시도해 주세요.')}
        </p>
      )}
      <LoginPrompt login={login} />
    </>
  );
}
