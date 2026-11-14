import { PropsWithChildren } from 'react';

const FRAME_CLASS =
  'sticky top-0 z-30 w-full shrink-0 border-b border-neutral-200 bg-white px-4 py-3 text-neutral-900 md:px-6';

/** 내용 높이를 따르는 공용 헤더 면이며 드롭다운·펼침을 자르지 않음. */
export default function HeaderFrame(props: PropsWithChildren) {
  return <header className={FRAME_CLASS}>{props.children}</header>;
}
