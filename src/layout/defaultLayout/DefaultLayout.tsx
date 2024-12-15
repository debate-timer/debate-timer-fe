import { PropsWithChildren } from 'react';
import StickyTriSectionHeader from '../components/header/StickyTriSectionHeader';
import FixedFooterWrapper from '../components/footer/FixedFooterWrapper';
import ContentContanier from '../components/main/ContentContanier';

function DefaultLayout(props: PropsWithChildren) {
  const { children } = props;

  return <div className="flex h-screen flex-col">{children}</div>;
}

DefaultLayout.Header = StickyTriSectionHeader;
DefaultLayout.ContentContanier = ContentContanier;
DefaultLayout.FixedFooterWrapper = FixedFooterWrapper;
export default DefaultLayout;
