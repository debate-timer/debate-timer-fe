import { Meta, StoryObj } from '@storybook/react';
import TimeBasedTimer from '../components/TimeBasedTimer';

// --- Mock 타이머 인스턴스 ---
const mockTimerInstance = {
  totalTimer: 150,
  speakingTimer: 50,
  isRunning: false,
  isDone: false,
  defaultTime: { defaultTotalTimer: 150, defaultSpeakingTimer: 50 },
  isSpeakingTimer: true,
  startTimer: () => {},
  pauseTimer: () => {},
  resetTimerForNextPhase: () => {},
  resetCurrentTimer: () => {},
  setTimers: () => {},
  setSavedTime: () => {},
  setDefaultTime: () => {},
  setIsSpeakingTimer: () => {},
  setIsDone: () => {},
  clearTimer: () => {},
};

const meta: Meta<typeof TimeBasedTimer> = {
  title: 'page/TimerPage/Components/TimeBasedTimer',
  component: TimeBasedTimer,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TimeBasedTimer>;

export const OnPros: Story = {
  args: {
    timeBasedTimerInstance: {
      ...mockTimerInstance,
    },
    isSelected: true,
    onActivate: () => {},
    prosCons: 'PROS',
    teamName: '찬성팀',
  },
};

export const OnCons: Story = {
  args: {
    timeBasedTimerInstance: {
      ...mockTimerInstance,
    },
    isSelected: true,
    onActivate: () => {},
    prosCons: 'CONS',
    teamName: '반대팀',
  },
};

export const OnRunning: Story = {
  args: {
    timeBasedTimerInstance: {
      ...mockTimerInstance,
      isRunning: true,
    },
    isSelected: true,
    onActivate: () => {},
    prosCons: 'PROS',
    teamName: '찬성팀',
  },
};

export const WhenOnlyTeamPerTime: Story = {
  args: {
    timeBasedTimerInstance: {
      ...mockTimerInstance,
      speakingTimer: null,
    },
    isSelected: true,
    onActivate: () => {},
    prosCons: 'PROS',
    teamName: '찬성팀',
  },
};
