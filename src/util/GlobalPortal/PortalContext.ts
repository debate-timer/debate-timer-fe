import { createContext } from 'react';
const PortalContext = createContext<HTMLDivElement | null>(null);
export default PortalContext;
