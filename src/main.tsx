import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GlobalPortal } from './util/GlobalPortal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './routes/routes.tsx';
import './index.css';
import { setupGoogleAnalytics } from './util/setupGoogleAnalytics.tsx';

// console.log(`# URL = ${import.meta.env.VITE_API_BASE_URL}`);
if (import.meta.env.DEV && !localStorage.getItem('accessToken')) {
  localStorage.setItem('accessToken', 'mock-token');
  console.log(
    '# Fake access token has set to %{}',
    localStorage.getItem('accessToken'),
  );
}

// Functions that calls msw mocking worker
if (import.meta.env.VITE_MOCK_API === 'true') {
  console.log('[msw] Mocking enabled.');

  // Import worker and start it
  import('./mocks/browser.ts').then(({ worker }) => {
    worker
      .start({
        onUnhandledRequest: (request, print) => {
          // Let worker dismiss non-api calls by check whether url includes '/api'
          if (!request.url.includes('/api')) {
            console.log(
              "Dismissed request that doesn't include /api/: " + request.url,
            );
          }

          print.warning();
        },
      })
      .then(() => {
        // After all jobs are done, initialize main React app
        initializeApp();
      });
  });
} else {
  console.log('[msw] Mocking disabled.');

  // If mocking is disabled, directly initialize main React app
  initializeApp();
}

// Function that initializes main React app
function initializeApp() {
  setupGoogleAnalytics();

  // Call queryClient for TanStack Query
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: true,
      },
      mutations: {
        throwOnError: true,
      },
    },
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <GlobalPortal.Provider>
          <RouterProvider router={router} />
        </GlobalPortal.Provider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
