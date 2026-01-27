import { useTranslation } from 'react-i18next';
import { ComponentType, ReactNode } from 'react';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { oAuthLogin } from '../../../util/googleAuth';
import { useNavigate } from 'react-router-dom';

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
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Wrapper closeButtonColor="text-neutral-1000">
      <DialogModal
        left={{
          text: t('아니오'),
          onClick: () => {
            onClose();
            navigate('/overview/customize/guest');
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
