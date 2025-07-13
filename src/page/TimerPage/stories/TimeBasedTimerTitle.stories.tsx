import { Meta, StoryObj } from '@storybook/react';
import TimeBasedTimerTitle from '../components/TimeBasedTimerTitle';

const meta: Meta<typeof TimeBasedTimerTitle> = {
  title: 'page/TimerPage/Components/TimeBasedTimerTitle',
  component: TimeBasedTimerTitle,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeBasedTimerTitle>;

export const Default: Story = {
  args: {
    children: <h1 className="text-xl font-bold text-slate-800">주도권 토론</h1>,
    width: 300,
  },
};
