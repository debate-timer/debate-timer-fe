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
      handleCloseAdditionalTimer: () => {},
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
    teamName: '찬성',
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
      handleCloseAdditionalTimer: () => {},
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
    teamName: '찬성',
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
      handleCloseAdditionalTimer: () => {},
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
    teamName: '찬성',
  },
};

export const OnMinus: Story = {
  args: {
    normalTimerInstance: {
      timer: -30,
      isRunning: false,
      isAdditionalTimerOn: true,
      setTimer: () => {},
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      handleChangeAdditionalTimer: () => {},
      handleCloseAdditionalTimer: () => {},
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
    teamName: '찬성',
  },
};

export const OnProsAdditionalTimerAvailable: Story = {
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
      handleCloseAdditionalTimer: () => {},
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
    teamName: '찬성',
    isAdditionalTimerAvailable: true,
  },
};

export const OnConsAdditionalTimerAvailable: Story = {
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
      handleCloseAdditionalTimer: () => {},
    },
    item: {
      stance: 'CONS',
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자',
      bell: null,
    },
    teamName: '찬성',
    isAdditionalTimerAvailable: true,
  },
};

export const OnSpeakerNameTooLong: Story = {
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
      handleCloseAdditionalTimer: () => {},
    },
    item: {
      stance: 'CONS',
      speechType: '입론1',
      boxType: 'TIME_BASED',
      time: 30,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '발언자 2847277237',
      bell: null,
    },
    teamName: '차아안서어엉',
    isAdditionalTimerAvailable: true,
  },
};
