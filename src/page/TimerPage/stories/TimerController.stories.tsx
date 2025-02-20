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
    onChangingTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isTimerChangeable: false,
    isRunning: false,
  },
};

export const OnRunning: Story = {
  args: {
    onChangingTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isTimerChangeable: false,
    isRunning: true,
  },
};

export const WhenAdditionalTimerAvailable: Story = {
  args: {
    onChangingTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isTimerChangeable: true,
    isRunning: false,
  },
};
