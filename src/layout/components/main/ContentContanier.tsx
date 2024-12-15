import { PropsWithChildren } from 'react';

export default function ContentContanier(props: PropsWithChildren) {
  const { children } = props;

  return <main className="flex flex-col">{children}</main>;
}
