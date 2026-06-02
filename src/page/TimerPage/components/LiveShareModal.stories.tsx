import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import { ApiUrl } from '../../../apis/endpoints';
import { socketManager } from '../../../apis/sockets/SocketManager';
import LiveShareModal from './LiveShareModal';
import { StompSubscription } from '@stomp/stompjs';

const meta: Meta<typeof LiveShareModal> = {
  title: 'page/TimerPage/components/LiveShareModal',
  component: LiveShareModal,
  tags: ['autodocs'],
  args: {
    shareUrl: '',
    toggleModal: () => {},
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof LiveShareModal>;

export const Default: Story = {
  args: {
    isLoading: false,
    isError: false,
    errorType: 'else',
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${ApiUrl.live}/:tableId/chairman-token`, () => {
          return HttpResponse.json({
            chairmanToken: 'mock-token-123',
          });
        }),
      ],
    },
  },
  decorators: [
    (Story) => {
      // Monkey patch socketManager to simulate a successful connection
      const originalIsConnected = socketManager.isConnected;
      const originalSubscribe = socketManager.subscribe;
      const originalConnect = socketManager.connect;
      const originalDisconnect = socketManager.disconnect;

      socketManager.isConnected = () => true;
      socketManager.subscribe = () =>
        ({
          id: 'dummy',
          unsubscribe: () => {},
        }) as StompSubscription;
      socketManager.connect = () => {};
      socketManager.disconnect = () => {};

      useEffect(() => {
        return () => {
          socketManager.isConnected = originalIsConnected;
          socketManager.subscribe = originalSubscribe;
          socketManager.connect = originalConnect;
          socketManager.disconnect = originalDisconnect;
        };
      }, [
        originalConnect,
        originalIsConnected,
        originalSubscribe,
        originalDisconnect,
      ]);

      return <Story />;
    },
  ],
};

export const Failed: Story = {
  args: {
    isLoading: false,
    isError: true,
    errorType: 'token',
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${ApiUrl.live}/:tableId/chairman-token`, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
  decorators: [
    (Story) => {
      // Prevent socketManager from attempting to connect to a real server
      const originalConnect = socketManager.connect;
      socketManager.connect = () => {};

      useEffect(() => {
        return () => {
          socketManager.connect = originalConnect;
        };
      }, [originalConnect]);

      return <Story />;
    },
  ],
};

export const Loading: Story = {
  args: {
    isLoading: true,
    isError: false,
    errorType: 'else',
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${ApiUrl.live}/:tableId/chairman-token`, async () => {
          await delay('infinite');
          return HttpResponse.json({
            chairmanToken: 'mock-token-123',
          });
        }),
      ],
    },
  },
  decorators: [
    (Story) => {
      // Prevent socketManager from attempting to connect to a real server
      const originalConnect = socketManager.connect;
      socketManager.connect = () => {};

      useEffect(() => {
        return () => {
          socketManager.connect = originalConnect;
        };
      }, [originalConnect]);

      return <Story />;
    },
  ],
};
