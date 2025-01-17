import type { Preview } from '@storybook/react';
import '../src/index.css';
import { GlobalPortal } from '../src/util/GlobalPortal/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';

initialize();

const queryClient = new QueryClient();
const preview: Preview = {
  parameters: {
    msw: {
      handlers: { ...handlers },
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
      const { route = '/', routeState } = context.parameters;

      const initialEntries = [
        routeState
          ? { pathname: route, state: routeState }
          : { pathname: route },
      ];
      return (
        <QueryClientProvider client={queryClient}>
          <GlobalPortal.Provider>
            <MemoryRouter initialEntries={initialEntries}>
              <Story />
            </MemoryRouter>
          </GlobalPortal.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
