import { PropsWithChildren, ReactNode } from 'react';
import StickyFooterWrapper from '../components/footer/StickyFooterWrapper';
import ContentContainer from '../components/main/ContentContainer';
import PageHeaderFallback from '../components/header/PageHeaderFallback';

interface DefaultLayoutProps extends PropsWithChildren {
  header?: ReactNode;
}

function DefaultLayout(props: DefaultLayoutProps) {
  const { children, header = <PageHeaderFallback /> } = props;

  return (
    <div className="flex h-screen flex-col supports-[height:100dvh]:h-dvh">
      {header}
      {children}
    </div>
  );
}

DefaultLayout.ContentContainer = ContentContainer;
DefaultLayout.StickyFooterWrapper = StickyFooterWrapper;

export default DefaultLayout;
