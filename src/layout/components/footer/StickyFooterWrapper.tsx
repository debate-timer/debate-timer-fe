import { PropsWithChildren } from 'react';

export default function StickyFooterWrapper(props: PropsWithChildren) {
  const { children } = props;

  return (
    <footer className="sticky bottom-0 flex w-full content-center items-center gap-1 px-8">
      {children}
    </footer>
  );
}
