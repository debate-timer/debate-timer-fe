import { Meta, StoryObj } from '@storybook/react';
import NotificationBadge from './NotificationBadge';

const meta: Meta<typeof NotificationBadge> = {
  title: 'Components/NotificationBadge',
  component: NotificationBadge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NotificationBadge>;

export const WhenNoNotification: Story = {
  args: {
    count: 0,
  },
};
export const When1Notification: Story = {
  args: {
    count: 1,
  },
};
export const WhenMoreThan99Notification: Story = {
  args: {
    count: 100,
  },
};
export const Default: Story = {
  args: {
    count: 14,
  },
};
