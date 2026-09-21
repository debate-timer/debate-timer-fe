import { Meta, StoryObj } from '@storybook/react';
import AudienceFinishedPage from './AudienceFinishedPage';

const meta: Meta<typeof AudienceFinishedPage> = {
  title: 'page/AudienceFinishedPage',
  component: AudienceFinishedPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
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
      viewports: {
        mobile375: {
          name: 'Mobile 375',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
      },
      defaultViewport: 'mobile375',
    },
  },
};
