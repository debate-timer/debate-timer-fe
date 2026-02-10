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

interface LoginAndStoreModalProps {
  Wrapper: ComponentType<{
    children: ReactNode;
    closeButtonColor?: string;
  }>;
  onClose: () => void;
}

export function LoginAndStoreModal({
  Wrapper,
  onClose,
}: LoginAndStoreModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  return (
    <Wrapper closeButtonColor="text-neutral-1000">
      <DialogModal
        left={{
          text: t('아니오'),
          onClick: () => {
            onClose();
            navigate(buildLangPath('/overview/customize/guest', lang));
          },
        }}
        right={{
          text: t('네'),
          onClick: () => {
            onClose();
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
