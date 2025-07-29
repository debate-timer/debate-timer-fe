import { Meta, StoryObj } from '@storybook/react';
import CircularTimer from '../components/CircularTimer';
import { MotionValue } from 'framer-motion';

const meta: Meta<typeof CircularTimer> = {
  title: 'page/TimerPage/Components/CircularTimer',
  component: CircularTimer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CircularTimer>;

const value = new MotionValue<number>(30);

export const OnPros: Story = {
  args: {
    progress: value,
    size: 480,
    strokeWidth: 20,
    stance: 'PROS',
    children: <span className="text-timer text-default-black">02 : 30</span>,
  },
};

export const OnCons: Story = {
  args: {
    progress: value,
    size: 480,
    strokeWidth: 20,
    stance: 'CONS',
    children: <span className="text-timer text-default-black">02 : 30</span>,
  },
};

export const OnNeutral: Story = {
  args: {
    progress: value,
    size: 480,
    strokeWidth: 20,
    stance: 'NEUTRAL',
    children: <span className="text-timer text-default-black">02 : 30</span>,
  },
};

export const OnSmallerSize: Story = {
  args: {
    progress: value,
    size: 360,
    strokeWidth: 15,
    stance: 'NEUTRAL',
    children: (
      <span className="text-[80px] font-bold text-default-black">02 : 30</span>
    ),
  },
};
