import { PropsWithChildren } from 'react';
import { IoMdHome } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../../hooks/mutations/useLogout';
import IconButton from '../../../components/IconButton/IconButton';
import { isLoggedIn } from '../../../util/accessToken';
import {
  isGuestFlow,
  deleteSessionCustomizeTableData,
} from '../../../util/sessionStorage';
import { oAuthLogin } from '../../../util/googleAuth';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';

// The type of header icons will be declared here.
type HeaderIcons = 'home';

function StickyTriSectionHeader(props: PropsWithChildren) {
  const { children } = props;

  return (
    <header className="sticky top-0 min-h-20 border-b-[1px] border-neutral-900 px-6">
      <div className="relative flex h-full items-center justify-between">
        {children}
      </div>
    </header>
  );
}

StickyTriSectionHeader.Left = function Left(props: PropsWithChildren) {
  const { children } = props;
  return <div className="flex-1 items-start text-start">{children}</div>;
};

StickyTriSectionHeader.Center = function Center(props: PropsWithChildren) {
  const { children } = props;
  return <div className="flex-1 items-center text-center">{children}</div>;
};

StickyTriSectionHeader.Right = function Right(props: PropsWithChildren) {
  const { children: buttons } = props;
  const navigate = useNavigate();
  const { mutate: logoutMutate } = useLogout(() => navigate('/home'));
  const { openModal, closeModal, ModalWrapper } = useModal({});
  const defaultIcons: HeaderIcons[] = ['home']; // Icons that will be displayed on all pages are added here

  const handleLoginStart = (keepData: boolean) => {
    sessionStorage.setItem('keepGuestTable', String(keepData));
    closeModal();
    oAuthLogin();
  };

  return (
    <>
      <div className="flex flex-1 items-stretch justify-end gap-2 text-right">
        {/* Auth related header items */}
        <>
          {/* Guest mode indicator */}
          {isGuestFlow() && (
            <div className="animate-pulse rounded-full bg-neutral-300 px-4 py-2 font-semibold">
              비회원 모드
            </div>
          )}

          {/* Login and logout button */}
          {isLoggedIn() && (
            <button
              className="rounded-full px-4 py-2 font-bold hover:bg-neutral-300"
              onClick={() => logoutMutate()}
            >
              로그아웃
            </button>
          )}
          {!isLoggedIn() && (
            <button
              className="rounded-full px-4 py-2 font-bold hover:bg-neutral-300"
              onClick={() => openModal()}
            >
              로그인
            </button>
          )}

          <div className="w-[1px] self-stretch bg-neutral-500" />
        </>

        {/* Buttons given as an argument */}
        {buttons}

        {/* Normal buttons */}
        {defaultIcons.map((iconName, index) => {
          switch (iconName) {
            case 'home':
              return (
                <div key={`${iconName}-${index}`}>
                  <IconButton
                    icon={<IoMdHome size={24} />}
                    onClick={() => {
                      if (isGuestFlow()) {
                        deleteSessionCustomizeTableData();
                      }
                      navigate('/home');
                    }}
                  />
                </div>
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
            onClick: () => handleLoginStart(false),
          }}
          right={{
            text: '네',
            onClick: () => handleLoginStart(true),
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
