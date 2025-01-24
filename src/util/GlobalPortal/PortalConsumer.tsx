import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PortalContext from './PortalContext';

interface PortalConsumerProps {
  children: ReactNode;
}

export function PortalConsumer({ children }: PortalConsumerProps) {
  return (
    <PortalContext.Consumer>
      {(portalContainerRef) => {
        if (portalContainerRef === null) {
          return null;
        }

        return createPortal(children, portalContainerRef);
      }}
    </PortalContext.Consumer>
  );
}
