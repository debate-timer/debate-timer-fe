import { PropsWithChildren } from 'react';
import { IoMdHome } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../../hooks/mutations/useLogout';
import { IoLogIn, IoLogOut } from 'react-icons/io5';
import IconButton from '../../../components/IconButton/IconButton';
import { isLoggedIn } from '../../../util/accessToken';
import {
  isGuestFlow,
  deleteSessionCustomizeTableData,
} from '../../../util/sessionStorage';
import { AuthLogin } from '../../../util/googleAuth';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';

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

type HeaderIcons = 'home' | 'logout' | 'guest' | 'auth';

StickyTriSectionHeader.Right = function Right(props: PropsWithChildren) {
  const { children } = props;
  const navigate = useNavigate();
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));
  const { openModal, closeModal, ModalWrapper } = useModal({});
  const defaultIcons: HeaderIcons[] = [];

  if (isGuestFlow()) {
    defaultIcons.push('guest');
  }

  if (isLoggedIn()) {
    defaultIcons.push('home', 'auth');
  } else {
    defaultIcons.push('auth');
  }

  return (
    <>
      <div className="flex flex-1 items-stretch justify-end gap-2 text-right">
        {children && (
          <>
            {children}
            <div className="w-[1px] self-stretch bg-neutral-500" />
          </>
        )}

        {defaultIcons.map((iconName, index) => {
          switch (iconName) {
            case 'guest':
              return (
                <div key={`${iconName}-${index}`}>
                  <div className="animate-pulse rounded-full bg-neutral-300 px-4 py-2 font-semibold">
                    비회원 모드
                  </div>
                </div>
              );
            case 'home':
              return (
                <div key={`${iconName}-${index}`}>
                  <IconButton
                    icon={<IoMdHome size={24} />}
                    onClick={() => {
                      if (isGuestFlow()) {
                        deleteSessionCustomizeTableData();
                      }
                      navigate('/');
                    }}
                  />
                </div>
              );
            case 'auth':
              if (isLoggedIn()) {
                return (
                  <div key={`${iconName}-${index}`}>
                    <IconButton
                      icon={<IoLogOut size={24} />}
                      onClick={() => logoutMutate()}
                      title="로그아웃"
                    />
                  </div>
                );
              } else {
                return (
                  <div key={`${iconName}-${index}`}>
                    <IconButton
                      icon={<IoLogIn size={24} />}
                      onClick={() => openModal()}
                      title="로그인"
                    />
                  </div>
                );
              }
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
              AuthLogin();
            },
          }}
          right={{
            text: '네',
            onClick: () => {
              closeModal();
              AuthLogin();
            },
            isBold: true,
          }}
        >
          <div className="break-keep px-20 py-10 text-xl font-bold">
            비회원으로 사용하던 시간표가 있습니다. <br />
            로그인 후에도 이 시간표를 계속 사용하시겠습니까?
          </div>
        </DialogModal>
      </ModalWrapper>
    </>
  );
};

export default StickyTriSectionHeader;
