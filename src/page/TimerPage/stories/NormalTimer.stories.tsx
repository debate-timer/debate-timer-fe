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
    normalTimerInstance: {
      timer: 150,
      isRunning: false,
      isAdditionalTimerOn: true,
      setTimer: () => {},
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      handleChangeAdditionalTimer: () => {},
    },
    item: {
      stance: 'PROS',
      speechType: '입론1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자',
      bell: null,
    },
  },
};

export const OnCons: Story = {
  args: {
    normalTimerInstance: {
      timer: 150,
      isRunning: false,
      isAdditionalTimerOn: true,
      setTimer: () => {},
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      handleChangeAdditionalTimer: () => {},
    },
    item: {
      stance: 'CONS',
      speechType: '입론1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자',
      bell: null,
    },
  },
};

export const OnNeutral: Story = {
  args: {
    normalTimerInstance: {
      timer: 150,
      isRunning: false,
      isAdditionalTimerOn: true,
      setTimer: () => {},
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      handleChangeAdditionalTimer: () => {},
    },
    item: {
      stance: 'NEUTRAL',
      speechType: '작전 시간',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '홍길동',
      bell: null,
    },
  },
};

export const OnRunning: Story = {
  args: {
    normalTimerInstance: {
      timer: 150,
      isRunning: false,
      isAdditionalTimerOn: true,
      setTimer: () => {},
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      handleChangeAdditionalTimer: () => {},
    },
    item: {
      stance: 'PROS',
      speechType: '입론 1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '홍길동',
      bell: null,
    },
  },
};

export const WhenAdditionalTimerAvailable: Story = {
  args: {
    normalTimerInstance: {
      timer: 150,
      isRunning: false,
      isAdditionalTimerOn: true,
      setTimer: () => {},
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      handleChangeAdditionalTimer: () => {},
    },
    item: {
      stance: 'PROS',
      speechType: '입론 1',
      boxType: 'NORMAL',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '홍길동',
      bell: null,
    },
  },
};

export const OnAdditionalTimerEnabled: Story = {
  args: {
    normalTimerInstance: {
      timer: 150,
      isRunning: false,
      isAdditionalTimerOn: true,
      setTimer: () => {},
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      handleChangeAdditionalTimer: () => {},
    },
    item: {
      stance: 'PROS',
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자',
      bell: null,
    },
  },
};
