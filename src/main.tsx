import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GlobalPortal } from './util/GlobalPortal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './route';
import './index.css';

// Functions that calls msw mocking worker
async function enableMocking() {
  // If project is running or built on development mode, exit.
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Bring worker from specified file
  const { worker } = await import('./mocks/browser.tsx');

  // Let worker dismiss non-api calls by check whether url includes '/api/'
  return worker.start({
    onUnhandledRequest: (request, print) => {
      if (!request.url.includes('/api/')) {
        console.log(
          "Dismissed request that doesn't include /api/: " + request.url,
        );
      }

      print.warning();
    },
  });
}

enableMocking().then(() => {
  // Call queryClient for TanStack Query
  const queryClient = new QueryClient();

  // Main React app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <GlobalPortal.Provider>
          <RouterProvider router={router} />
        </GlobalPortal.Provider>
      </QueryClientProvider>
    </StrictMode>,
  );
});
