import { Meta, StoryObj } from '@storybook/react';
import Timer from '../components/Timer';

const meta: Meta<typeof Timer> = {
  title: 'page/TimerPage/Components/Timer',
  component: Timer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Timer>;

export const OnPros: Story = {
  args: {
    onChangingTimer: () => {},
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

export const OnCons: Story = {
  args: {
    onChangingTimer: () => {},
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

export const OnNeutral: Story = {
  args: {
    onChangingTimer: () => {},
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

export const OnRunning: Story = {
  args: {
    onChangingTimer: () => {},
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
    onChangingTimer: () => {},
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

export const WhenAdditionalTimerAvailable: Story = {
  args: {
    onChangingTimer: () => {},
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

export const OnAdditionalTimerEnabled: Story = {
  args: {
    onChangingTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    timer: 150,
    isAdditionalTimerOn: true,
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
