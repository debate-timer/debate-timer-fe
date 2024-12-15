import { PropsWithChildren } from 'react';

export default function FixedFooterWrapper(props: PropsWithChildren) {
  const { children } = props;

  return (
    <footer className="fixed bottom-0 flex w-full flex-col content-center items-center gap-1">
      {children}
    </footer>
  );
}
