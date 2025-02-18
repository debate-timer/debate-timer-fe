import { Meta, StoryObj } from '@storybook/react';
import Timer from './Timer';

const meta: Meta<typeof Timer> = {
  title: 'page/TimerPage/Components/Timer',
  component: Timer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Timer>;

export const Pros: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    timer: 150,
    isTimerChangeable: false,
    isRunning: false,
    item: {
      stance: 'PROS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const Cons: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    timer: 150,
    isTimerChangeable: false,
    isRunning: false,
    item: {
      stance: 'CONS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const Neutral: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    timer: 150,
    isTimerChangeable: false,
    isRunning: false,
    item: {
      stance: 'NEUTRAL',
      type: 'TIME_OUT',
      time: 60,
    },
  },
};

export const Running: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    timer: 150,
    isTimerChangeable: false,
    isRunning: true,
    item: {
      stance: 'CONS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const Under0sec: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    timer: -90,
    isTimerChangeable: false,
    isRunning: true,
    item: {
      stance: 'PROS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const AdditionalTimerAvailable: Story = {
  args: {
    onChangeTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    timer: 150,
    isTimerChangeable: true,
    isRunning: false,
    item: {
      stance: 'CONS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};
