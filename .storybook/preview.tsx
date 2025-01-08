import type { Preview } from '@storybook/react';
import '../src/index.css';
import { GlobalPortal } from '../src/util/GlobalPortal/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

const queryClient = new QueryClient();
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
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
    mswDecorator,
  ],
};

export default preview;
