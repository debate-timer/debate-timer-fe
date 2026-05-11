import { useTranslation } from 'react-i18next';
import { ComponentType, ReactNode } from 'react';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { oAuthLogin } from '../../../util/googleAuth';
import { useNavigate } from 'react-router-dom';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';
import useAnalytics from '../../../hooks/useAnalytics';
import { setLoginTrigger } from '../../../util/analytics/loginTrigger';

interface LoginAndStoreModalProps {
  Wrapper: ComponentType<{
    children: ReactNode;
    closeButtonColor?: string;
  }>;
  onClose: () => void;
}

// 토론 종료 후 로그인 저장 여부를 묻는 확인 모달이다.
export function LoginAndStoreModal({
  Wrapper,
  onClose,
}: LoginAndStoreModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  return (
    <Wrapper closeButtonColor="text-neutral-1000">
      <DialogModal
        left={{
          text: t('아니오'),
          onClick: () => {
            // 저장 없이 게스트 개요 화면으로 바로 이동한다.
            onClose();
            navigate(buildLangPath('/overview/customize/guest', lang));
          },
        }}
        right={{
          text: t('네'),
          onClick: () => {
            onClose();
            // 모달에서 로그인 시작 시 login_started 이벤트를 기록한다.
            trackEvent('login_started', {
              trigger_page: window.location.pathname,
              trigger_context: 'timer_modal',
            });
            // 로그인 완료 후 복귀 맥락을 복원할 수 있도록 트리거를 저장한다.
            setLoginTrigger({
              trigger_page: window.location.pathname,
              trigger_context: 'timer_modal',
            });
            oAuthLogin();
          },
          isBold: true,
        }}
      >
        <div className="whitespace-pre-line break-keep px-20 py-10 text-center text-xl font-bold">
          {t('토론을 끝내셨군요!\n지금까지의 시간표를 로그인하고 저장할까요?')}
        </div>
      </DialogModal>
    </Wrapper>
  );
}
