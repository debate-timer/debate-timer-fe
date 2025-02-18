import { Meta, StoryObj } from '@storybook/react';
import TimeTableItem from './TimeTableItem';

const meta: Meta<typeof TimeTableItem> = {
  title: 'page/TimerPage/Components/TimeTableItem',
  component: TimeTableItem,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeTableItem>;

export const CurrentPros: Story = {
  args: {
    isCurrent: true,
    data: {
      stance: 'PROS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const CurrentCons: Story = {
  args: {
    isCurrent: true,
    data: {
      stance: 'CONS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const CurrentNeutral: Story = {
  args: {
    isCurrent: true,
    data: {
      stance: 'NEUTRAL',
      type: 'TIME_OUT',
      time: 60,
    },
  },
};

export const NotCurrent: Story = {
  args: {
    isCurrent: false,
    data: {
      stance: 'CONS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const MoreThan60sec: Story = {
  args: {
    isCurrent: true,
    data: {
      stance: 'PROS',
      type: 'OPENING',
      time: 90,
      speakerNumber: 1,
    },
  },
};

export const LessThan60sec: Story = {
  args: {
    isCurrent: true,
    data: {
      stance: 'PROS',
      type: 'OPENING',
      time: 30,
      speakerNumber: 1,
    },
  },
};
