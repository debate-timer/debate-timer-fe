import { PropsWithChildren } from 'react';
import { IoMdHome } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../../hooks/mutations/useLogout';
import { IoLogIn, IoLogOut } from 'react-icons/io5';
import IconButton from '../../../components/IconButton/IconButton';
import {
  deleteSessionCustomizeTableData,
  isGuestFlow,
} from '../../../util/sessionStorage';
import { AuthLogin } from '../../../util/googleAuth';
import { useModal } from '../../../hooks/useModal';
import LoginAndStoreDBModal from '../../../components/LoginAndStoreDBModal/LoginAndStoreDBModal';

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

interface RightProps extends PropsWithChildren {
  defaultIcons?: ('home' | 'auth')[];
}

StickyTriSectionHeader.Right = function Right({
  children,
  defaultIcons,
}: RightProps) {
  const navigate = useNavigate();
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));
  const { openModal, closeModal, ModalWrapper } = useModal({});
  return (
    <>
      <div className="flex flex-1  items-stretch justify-end gap-2 text-right">
        {children && (
          <>
            {children}
            <div className="w-[1px] self-stretch bg-neutral-500" />
          </>
        )}

        {defaultIcons?.map((iconName, index) => {
          switch (iconName) {
            case 'home':
              return (
                <div key={`${iconName}-${index}`}>
                  <IconButton
                    icon={<IoMdHome size={24} />}
                    onClick={() => navigate('/')}
                  />
                </div>
              );
            case 'auth':
              if (isGuestFlow()) {
                return (
                  <div key={`${iconName}-${index}`}>
                    <IconButton
                      icon={<IoLogIn size={24} />}
                      onClick={() => openModal()}
                      title="로그인 하기"
                    />
                  </div>
                );
              } else {
                return (
                  <div key={`${iconName}-${index}`}>
                    <IconButton
                      icon={<IoLogOut size={24} />}
                      onClick={() => logoutMutate()}
                      title="로그아웃 하기"
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
        <LoginAndStoreDBModal
          onSaveAndLogin={() => {
            closeModal();
            AuthLogin();
          }}
          onOnlyLogin={() => {
            deleteSessionCustomizeTableData();
            closeModal();
            AuthLogin();
          }}
        >
          <>
            비회원으로 사용하던 데이터가 있습니다. <br />
            로그인 후에도 이 데이터를 계속 사용하시겠습니까?
          </>
        </LoginAndStoreDBModal>
      </ModalWrapper>
    </>
  );
};

export default StickyTriSectionHeader;
