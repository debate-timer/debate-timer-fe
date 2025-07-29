import { Meta, StoryObj } from '@storybook/react';
import TimerController from '../components/TimerController';

const meta: Meta<typeof TimerController> = {
  title: 'page/TimerPage/Components/TimerController',
  component: TimerController,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimerController>;

export const OnStopped: Story = {
  args: {
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isRunning: false,
  },
};

export const OnRunning: Story = {
  args: {
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isRunning: true,
  },
};
