import { INQUIRY_LINKS } from '../../../constants/urls';
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

/** 앱 수명의 설정·권한과 일반 헤더의 탐색 입력을 연결함. */
export default function GeneralHeaderContainer() {
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
              <HeaderLoginButton onClick={() => login.requestLogin()} />
            )}
          </>
        }
      />
      <LoginPrompt login={login} />
    </>
  );
}
