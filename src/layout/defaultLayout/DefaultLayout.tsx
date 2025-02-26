import { PropsWithChildren } from 'react';
import StickyTriSectionHeader from '../components/header/StickyTriSectionHeader';
import StickyFooterWrapper from '../components/footer/StickyFooterWrapper';
import ContentContainer from '../components/main/ContentContainer';

function DefaultLayout(props: PropsWithChildren) {
  const { children } = props;

  return <div className="flex h-screen flex-col">{children}</div>;
}

DefaultLayout.Header = StickyTriSectionHeader;
DefaultLayout.ContentContainer = ContentContainer;
DefaultLayout.StickyFooterWrapper = StickyFooterWrapper;
export default DefaultLayout;
