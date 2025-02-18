import { Meta, StoryObj } from '@storybook/react';
import TimerController from './TimerController';

const meta: Meta<typeof TimerController> = {
  title: 'page/TimerPage/Components/TimerController',
  component: TimerController,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimerController>;

export const Stopped: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isTimerChangeable: false,
    isRunning: false,
  },
};

export const Running: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isTimerChangeable: false,
    isRunning: true,
  },
};

export const AdditionalTimerAvailable: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isTimerChangeable: true,
    isRunning: false,
  },
};
