// preview.ts
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import { GlobalPortal } from '../src/util/GlobalPortal/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StoryRouter from './StoryRouter';
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
    viewport: {
      options: {
        laptop1024: {
          name: 'Laptop 1024',
          styles: {
            width: '1024px',
            height: '768px',
          },
          type: 'desktop',
        },
        desktop1440: {
          name: 'Desktop 1440',
          styles: {
            width: '1440px',
            height: '900px',
          },
          type: 'desktop',
        },
        laptopMac13: {
          name: 'MacBook 13-inch',
          styles: {
            width: '1280px',
            height: '800px',
          },
          type: 'desktop',
        },
        laptopMac16: {
          name: 'MacBook Pro 16-inch',
          styles: {
            width: '1536px',
            height: '960px',
          },
          type: 'desktop',
        },
      },
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story, context) => {
      const { route = '/', routeState, routePattern } = context.parameters;

      return (
        <QueryClientProvider client={queryClient}>
          <GlobalPortal.Provider>
            <StoryRouter
              Story={Story}
              route={route}
              routeState={routeState}
              routePattern={routePattern}
            />
          </GlobalPortal.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
