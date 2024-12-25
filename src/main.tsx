import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './route';
import { GlobalPortal } from './util/GlobalPortal';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalPortal.Provider>
      <RouterProvider router={router} />
    </GlobalPortal.Provider>
  </StrictMode>,
);
