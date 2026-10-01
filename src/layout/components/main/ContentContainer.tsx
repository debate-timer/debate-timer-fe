import { PropsWithChildren } from 'react';

interface ContentContainerProps extends PropsWithChildren {
  noPadding?: boolean;
}

export default function ContentContainer({
  children,
  noPadding = false,
}: ContentContainerProps) {
  return (
    <main
      className={`relative flex flex-grow flex-col items-center gap-2 overflow-auto ${
        noPadding ? '' : 'px-4 py-4 md:px-8'
      }`}
    >
      {children}
    </main>
  );
}
