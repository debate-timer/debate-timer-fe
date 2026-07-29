import { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DialogModal from '../../../components/DialogModal/DialogModal';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';

interface MaintenanceEndModalProps {
  Wrapper: ComponentType<{
    children: ReactNode;
    closeButtonColor?: string;
  }>;
  onClose: () => void;
}

export default function MaintenanceEndModal({
  Wrapper,
  onClose,
}: MaintenanceEndModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(buildLangPath(path, lang));
  };

  return (
    <Wrapper closeButtonColor="text-neutral-1000">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-end-message"
      >
        <DialogModal
          left={{
            text: t('아니오'),
            onClick: () => handleNavigate('/overview/customize/guest'),
          }}
          right={{
            text: t('예'),
            onClick: () => handleNavigate('/home'),
            isBold: true,
          }}
        >
          <p
            id="maintenance-end-message"
            className="break-keep px-20 py-10 text-center text-xl font-bold"
          >
            {t('토론이 끝났습니다. 종료하시겠습니까?')}
          </p>
        </DialogModal>
      </div>
    </Wrapper>
  );
}
