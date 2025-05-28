import { Meta, StoryObj } from '@storybook/react';
import NormalTimer from '../components/NormalTimer';

const meta: Meta<typeof NormalTimer> = {
  title: 'page/TimerPage/Components/NormalTimer',
  component: NormalTimer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NormalTimer>;

export const OnPros: Story = {
  args: {
    onChangingTimer: () => {},
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    goToOtherItem: (isPrev: boolean) => {
      console.log(isPrev);
    },
    addOnTimer: () => {},
    timer: 150,
    isAdditionalTimerOn: false,
    isTimerChangeable: false,
    isRunning: false,
    isLastItem: false,
    isFirstItem: false,
    item: {
      stance: 'PROS',
      speechType: '입론1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자',
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
    addOnTimer: () => {},
    timer: 150,
    isAdditionalTimerOn: false,
    isTimerChangeable: false,
    isRunning: false,
    isLastItem: false,
    isFirstItem: false,
    item: {
      stance: 'CONS',
      speechType: '입론1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자',
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
    addOnTimer: () => {},
    timer: 150,
    isAdditionalTimerOn: false,
    isTimerChangeable: false,
    isRunning: false,
    isLastItem: false,
    isFirstItem: false,
    item: {
      stance: 'NEUTRAL',
      speechType: '작전 시간',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '홍길동',
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
    addOnTimer: () => {},
    timer: 150,
    isAdditionalTimerOn: false,
    isTimerChangeable: false,
    isRunning: true,
    isLastItem: false,
    isFirstItem: false,
    item: {
      stance: 'PROS',
      speechType: '입론 1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '홍길동',
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
    addOnTimer: () => {},
    timer: 150,
    isAdditionalTimerOn: false,
    isTimerChangeable: true,
    isRunning: true,
    isLastItem: false,
    isFirstItem: false,
    item: {
      stance: 'PROS',
      speechType: '입론 1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '홍길동',
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
    addOnTimer: () => {},
    timer: 150,
    isAdditionalTimerOn: true,
    isTimerChangeable: false,
    isRunning: false,
    isLastItem: false,
    isFirstItem: false,
    item: {
      stance: 'PROS',
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자',
    },
  },
};
