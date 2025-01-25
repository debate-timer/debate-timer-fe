import { PropsWithChildren } from 'react';

function StickyTriSectionHeader(props: PropsWithChildren) {
  const { children } = props;

  return (
    <header className="sticky top-0 min-h-20 bg-slate-200 px-6">
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
  const { children } = props;
  return <div className="flex-1 items-end text-right">{children}</div>;
};

export default StickyTriSectionHeader;
