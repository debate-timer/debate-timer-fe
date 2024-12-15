import { PropsWithChildren } from 'react';

function StickyTriSectionHeader(props: PropsWithChildren) {
  const { children } = props;

  return (
    <header className="sticky top-0 h-20 bg-slate-300 px-2">
      <div className="relative flex h-full items-center justify-between gap-x-6">
        {children}
      </div>
    </header>
  );
}

StickyTriSectionHeader.Left = function Left(props: PropsWithChildren) {
  const { children } = props;
  return <div>{children}</div>;
};

StickyTriSectionHeader.Center = function Center(props: PropsWithChildren) {
  const { children } = props;
  return <div>{children}</div>;
};

StickyTriSectionHeader.Right = function Right(props: PropsWithChildren) {
  const { children } = props;
  return <div>{children}</div>;
};

export default StickyTriSectionHeader;
