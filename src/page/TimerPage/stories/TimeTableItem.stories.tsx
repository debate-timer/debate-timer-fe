import { Meta, StoryObj } from '@storybook/react';
import TimeTableItem from '../components/TimeTableItem';

const meta: Meta<typeof TimeTableItem> = {
  title: 'page/TimerPage/Components/TimeTableItem',
  component: TimeTableItem,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeTableItem>;

export const IfCurrentIsPros: Story = {
  args: {
    isCurrent: true,
    item: {
      stance: 'PROS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const IfCurrentIsCons: Story = {
  args: {
    isCurrent: true,
    item: {
      stance: 'CONS',
      type: 'OPENING',
      time: 60,
      speakerNumber: 1,
    },
  },
};

export const IfCurrentIsNeutral: Story = {
  args: {
    isCurrent: true,
    item: {
      stance: 'NEUTRAL',
      type: 'TIME_OUT',
      time: 60,
    },
  },
};

export const IfNotCurrent: Story = {
  args: {
    isCurrent: false,
    item: {
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
    item: {
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
    item: {
      stance: 'PROS',
      type: 'OPENING',
      time: 30,
      speakerNumber: 1,
    },
  },
};

export const OnPossibleOverflow: Story = {
  args: {
    isCurrent: true,
    item: {
      stance: 'PROS',
      type: 'CLOSING',
      time: 630,
      speakerNumber: 1,
    },
  },
};
