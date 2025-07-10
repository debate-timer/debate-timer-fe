import { ComponentType, ReactNode } from 'react';
import DialogModal from '../../../components/DialogModal/DialogModal';
import { oAuthLogin } from '../../../util/googleAuth';

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
  return (
    <Wrapper closeButtonColor="text-neutral-1000">
      <DialogModal
        left={{
          text: '아니오',
          onClick: onClose,
        }}
        right={{
          text: '네',
          onClick: () => {
            onClose();
            oAuthLogin();
          },
          isBold: true,
        }}
      >
        <div className="break-keep px-20 py-10 text-center text-xl font-bold">
          토론을 끝내셨군요! <br />
          지금까지의 시간표를 로그인하고 저장할까요?
        </div>
      </DialogModal>
    </Wrapper>
  );
}
