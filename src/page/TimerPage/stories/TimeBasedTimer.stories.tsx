import { Meta, StoryObj } from '@storybook/react';
import TimeBasedTimer from '../components/TimeBasedTimer';

const meta: Meta<typeof TimeBasedTimer> = {
  title: 'page/TimerPage/Components/TimeBasedTimer',
  component: TimeBasedTimer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeBasedTimer>;

export const OnPros: Story = {
  args: {
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: false,
    isSelected: true,
    prosCons: 'pros',
  },
};

export const OnCons: Story = {
  args: {
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: false,
    isSelected: true,
    prosCons: 'cons',
  },
};

export const OnRunning: Story = {
  args: {
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isSelected: true,
    isRunning: true,
  },
};

export const WhenOnlyTeamPerTime: Story = {
  args: {
    onPause: () => {},
    onReset: () => {},
    onStart: () => {},
    timer: 150,
    isRunning: false,
    isSelected: true,
    speakingTimer: null,
  },
};
