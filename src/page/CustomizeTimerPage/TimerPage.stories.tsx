import { Meta, StoryObj } from '@storybook/react';
import FreediscussionTimerPage from './CustomizeTimerPage';

const meta: Meta<typeof FreediscussionTimerPage> = {
  title: 'page/CustomizeTimerPage',
  component: FreediscussionTimerPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FreediscussionTimerPage>;

export const Default: Story = {};
