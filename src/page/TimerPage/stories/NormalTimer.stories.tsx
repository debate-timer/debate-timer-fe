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
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: false,
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
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: false,
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
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: false,
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
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: true,
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
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: true,
    isAdditionalTimerAvailable: true,
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
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    isAdditionalTimerAvailable: true,
    timer: 150,
    isRunning: false,
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
