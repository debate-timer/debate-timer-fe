import { PropsWithChildren } from 'react';

export default function ContentContanier(props: PropsWithChildren) {
  const { children } = props;

  return (
    <main className="flex flex-col items-center gap-4 px-8 py-4">
      {children}
    </main>
  );
}
