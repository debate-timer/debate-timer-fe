import { PropsWithChildren } from 'react';

export default function StickyFooterWrapper(props: PropsWithChildren) {
  const { children } = props;

  return (
    <footer className="sticky bottom-0 flex w-full flex-shrink-0 content-center items-center justify-center gap-1 px-8">
      {children}
    </footer>
  );
}
