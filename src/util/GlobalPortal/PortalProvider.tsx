import { ReactNode, useState } from 'react';
import PortalContext from './PortalContext';

interface PortalProviderProps {
  children: ReactNode;
}

export function PortalProvider({ children }: PortalProviderProps) {
  const [portalContainerRef, setPortalContainerRef] =
    useState<HTMLDivElement | null>(null);

  return (
    <PortalContext.Provider value={portalContainerRef}>
      {children}
      <div
        id="portal-container"
        ref={(elem) => {
          if (portalContainerRef !== null || elem === null) {
            return;
          }
          setPortalContainerRef(elem);
        }}
      />
    </PortalContext.Provider>
  );
}
