import { PropsWithChildren } from 'react';
import { IoMdHome } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../../hooks/mutations/useLogout';
import { IoLogOut } from 'react-icons/io5';
import IconButton from '../../../components/IconButton/IconButton';

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
  defaultIcons?: ('home' | 'logout')[];
}

StickyTriSectionHeader.Right = function Right({
  children,
  defaultIcons,
}: RightProps) {
  const navigate = useNavigate();
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));

  return (
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
          case 'logout':
            return (
              <div key={`${iconName}-${index}`}>
                <IconButton
                  icon={<IoLogOut size={24} />}
                  onClick={() => logoutMutate()}
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default StickyTriSectionHeader;
