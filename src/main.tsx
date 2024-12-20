import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { GlobalPortal } from './util/GlobalPortal/index.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalPortal.Provider>
      <App />
    </GlobalPortal.Provider>
  </StrictMode>,
);
