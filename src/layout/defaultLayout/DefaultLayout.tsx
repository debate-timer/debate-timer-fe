import { PropsWithChildren } from 'react';
import StickyTriSectionHeader from '../components/header/StickyTriSectionHeader';
import StickyFooterWrapper from '../components/footer/StickyFooterWrapper';
import ContentContanier from '../components/main/ContentContanier';

function DefaultLayout(props: PropsWithChildren) {
  const { children } = props;

  return <div className="flex h-screen flex-col">{children}</div>;
}

DefaultLayout.Header = StickyTriSectionHeader;
DefaultLayout.ContentContanier = ContentContanier;
DefaultLayout.StickyFooterWrapper = StickyFooterWrapper;

export default DefaultLayout;
