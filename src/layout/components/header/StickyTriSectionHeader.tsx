import { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../../hooks/mutations/useLogout';
import { isLoggedIn } from '../../../util/accessToken';
import {
  isGuestFlow,
  deleteSessionCustomizeTableData,
} from '../../../util/sessionStorage';
import { oAuthLogin } from '../../../util/googleAuth';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';
import DTHome from '../../../components/icons/Home';
import DTLogin from '../../../components/icons/Login';

// The type of header icons will be declared here.
type HeaderIcons = 'home' | 'auth';

function StickyTriSectionHeader(props: PropsWithChildren) {
  const { children } = props;

  return (
    <header className="sticky top-0 h-[80px] border-b-[3px] border-default-disabled/hover p-[16px]">
      <div className="relative flex h-full items-center justify-between">
        {children}
      </div>
    </header>
  );
}

StickyTriSectionHeader.Left = function Left(props: PropsWithChildren) {
  const { children } = props;
  return (
    <div className="flex h-full flex-1 items-center justify-start text-start">
      {children}
    </div>
  );
};

StickyTriSectionHeader.Center = function Center(props: PropsWithChildren) {
  const { children } = props;
  return (
    <div className="flex h-full flex-1 items-center justify-center text-center">
      {children}
    </div>
  );
};

StickyTriSectionHeader.Right = function Right(props: PropsWithChildren) {
  const { children: buttons } = props;
  const navigate = useNavigate();
  const { mutate: logoutMutate } = useLogout(() => navigate('/home'));
  const { openModal, closeModal, ModalWrapper } = useModal({});
  const defaultIcons: HeaderIcons[] = ['home', 'auth']; // Icons that will be displayed on all pages are added here

  return (
    <>
      <div className="flex h-full flex-1 items-center justify-end gap-[12px] text-right">
        {isGuestFlow() && (
          <>
            {/* Guest mode indicator */}
            <div className="animate-pulse rounded-full bg-neutral-300 px-4 py-2 font-semibold">
              비회원 모드
            </div>

            {/* Vertical divider */}
            <div className="w-[1px] self-stretch bg-neutral-500" />
          </>
        )}

        {/* Buttons given as an argument */}
        {buttons}

        {/* Normal buttons */}
        {defaultIcons.map((iconName, index) => {
          switch (iconName) {
            case 'home':
              return (
                <button
                  className="flex h-full items-center justify-center"
                  key={`${iconName}-${index}`}
                  onClick={() => {
                    if (isGuestFlow()) {
                      deleteSessionCustomizeTableData();
                    }
                    navigate('/home');
                  }}
                >
                  <DTHome className="h-full" />
                </button>
              );
            case 'auth':
              return (
                <button
                  className="flex h-full items-center justify-center"
                  key={`${iconName}-${index}`}
                  onClick={() => {
                    if (isLoggedIn()) {
                      logoutMutate();
                    } else {
                      openModal();
                    }
                  }}
                >
                  <DTLogin className="h-full" />
                </button>
              );
            default:
              return null;
          }
        })}
      </div>

      <ModalWrapper closeButtonColor="text-neutral-1000">
        <DialogModal
          left={{
            text: '아니오',
            onClick: () => {
              deleteSessionCustomizeTableData();
              closeModal();
              oAuthLogin();
            },
          }}
          right={{
            text: '네',
            onClick: () => {
              closeModal();
              oAuthLogin();
            },
            isBold: true,
          }}
        >
          <div className="break-keep px-20 py-10 text-center text-xl font-bold">
            비회원으로 사용하던 시간표가 있습니다. <br />
            로그인 후에도 이 시간표를 계속 사용하시겠습니까?
          </div>
        </DialogModal>
      </ModalWrapper>
    </>
  );
};

export default StickyTriSectionHeader;
