import { Meta, StoryObj } from '@storybook/react-vite';
import AudienceFinishedPage from './AudienceFinishedPage';

const meta: Meta<typeof AudienceFinishedPage> = {
  title: 'page/AudienceFinishedPage',
  component: AudienceFinishedPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    route: '/live/1/end',
    routePattern: '/live/:id/end',
  },
};

export default meta;

type Story = StoryObj<typeof AudienceFinishedPage>;

export const Default: Story = {
  render: () => (
    <div className="h-screen w-screen overflow-hidden">
      <AudienceFinishedPage />
    </div>
  ),
};

export const Mobile: Story = {
  ...Default,
  parameters: {
    viewport: {
      options: {
        mobile375: {
          name: 'Mobile 375',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
      },
    },
  },
  globals: { viewport: { value: 'mobile375', isRotated: false } },
};

export const Aborted: Story = {
  ...Default,
  parameters: {
    routeState: { audienceTermination: { tableId: 1, reason: 'ABORT' } },
  },
};
export const Finished: Story = {
  ...Default,
  parameters: {
    routeState: { audienceTermination: { tableId: 1, reason: 'FINISHED' } },
  },
};
