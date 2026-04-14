import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GlobalPortal } from './util/GlobalPortal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './routes/routes.tsx';
import './index.css';
import './i18n';
import { setupAnalytics, analyticsManager } from './util/analytics';
import {
  getAccessToken,
  getMemberId,
  removeMemberId,
} from './util/accessToken';
import i18n from './i18n';

// Functions that calls msw mocking worker
if (import.meta.env.VITE_MOCK_API === 'true') {
  console.log('[msw] Mocking enabled.');

  // Import worker and start it
  import('./mocks/browser.ts').then(({ worker }) => {
    worker
      .start({
        onUnhandledRequest: (request, print) => {
          // Let worker dismiss non-api calls by check whether url includes '/api'
          if (!request.url.includes('/api') && !request.url.includes('/icon')) {
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
  setupAnalytics();

  // memberId 복원: accessToken + memberId 모두 존재 시 identity 설정
  const memberId = getMemberId();
  if (getAccessToken() && memberId) {
    analyticsManager.setUserId(memberId);
    analyticsManager.setUserProperties({
      user_type: 'member',
      language: document.documentElement.lang || 'ko',
    });
  } else if (memberId) {
    // accessToken 없이 memberId만 있으면 비회원 처리
    removeMemberId();
  }

  // 언어 변경 시 user property 업데이트
  i18n.on('languageChanged', (lng: string) => {
    analyticsManager.setUserProperties({
      user_type: getAccessToken() ? 'member' : 'guest',
      language: lng,
    });
  });

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
