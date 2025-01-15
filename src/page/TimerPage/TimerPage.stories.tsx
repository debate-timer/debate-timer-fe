import { Meta, StoryObj } from '@storybook/react';
import TimerPage from './TimerPage';

const meta: Meta<typeof TimerPage> = {
  title: 'page/TimerPage',
  component: TimerPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimerPage>;

export const Default: Story = {};
