import { PropsWithChildren } from 'react';

export default function ContentContanier(props: PropsWithChildren) {
  const { children } = props;

  return (
    <main className="relative flex flex-grow flex-col items-center gap-2 overflow-auto px-8 py-4">
      {children}
    </main>
  );
}
