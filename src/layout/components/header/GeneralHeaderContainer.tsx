import { INQUIRY_LINKS } from '../../../constants/urls';
import { useTranslation } from 'react-i18next';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import useFeatureFlag from '../../../hooks/useFeatureFlag';
import useLoginPrompt from '../../../hooks/useLoginPrompt';
import LoginPrompt from '../../../components/LoginPrompt/LoginPrompt';
import SettingsModal from '../../../components/SettingsModal/SettingsModal';
import LanguageSelector from './LanguageSelector';
import GeneralHeader from './GeneralHeader';
import {
  deleteSessionCustomizeTableData,
  isGuestFlow,
} from '../../../util/sessionStorage';

/** 앱 수명의 설정·권한과 일반 헤더의 탐색 입력을 연결함. */
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
            <SettingsModal onLogin={() => login.requestLogin()} />
            {!isMember && (
              <button
                type="button"
                aria-label={t('로그인')}
                className="min-h-11 rounded-xl bg-brand px-4 text-ui-label"
                onClick={() => login.requestLogin()}
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
