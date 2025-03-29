// preview.ts
import type { Preview } from '@storybook/react';
import '../src/index.css';
import { GlobalPortal } from '../src/util/GlobalPortal/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { allHandlers } from '../src/mocks/handlers/global';

initialize();

const queryClient = new QueryClient();

const preview: Preview = {
  parameters: {
    msw: {
      handlers: { ...allHandlers },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story, context) => {
      const { route = '/', routeState, routePattern } = context.parameters;

      const initialEntries = [
        routeState
          ? { pathname: route, state: routeState }
          : { pathname: route },
      ];

      return (
        <QueryClientProvider client={queryClient}>
          <GlobalPortal.Provider>
            <MemoryRouter initialEntries={initialEntries}>
              {/* routePattern이 지정된 경우에만 <Routes>로 감싸 URL 파라미터를 추출합니다. */}
              {routePattern ? (
                <Routes>
                  <Route path={routePattern} element={<Story />} />
                  {/* 혹은 fallback Route도 추가할 수 있습니다 */}
                  <Route path="*" element={<Story />} />
                </Routes>
              ) : (
                <Story />
              )}
            </MemoryRouter>
          </GlobalPortal.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
