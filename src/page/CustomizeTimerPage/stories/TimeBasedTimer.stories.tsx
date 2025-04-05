import { Meta, StoryObj } from '@storybook/react';
import TimeBasedTimer from '../components/TimeBasedTimer';

const meta: Meta<typeof TimeBasedTimer> = {
  title: 'page/CustomizeTimerPage/Components/TimeBasedTimer',
  component: TimeBasedTimer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeBasedTimer>;

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
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 10,
      timePerSpeaking: 10,
      speaker: '나',
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
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 10,
      timePerSpeaking: 10,
      speaker: '나',
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
      stance: 'PROS',
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 10,
      timePerSpeaking: 10,
      speaker: '나',
    },
  },
};

export const WhenOnlyTeamPerTime: Story = {
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
      stance: 'PROS',
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 10,
      timePerSpeaking: null,
      speaker: '나',
    },
  },
};
