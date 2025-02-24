import { Meta, StoryObj } from '@storybook/react';
import TimeTable from '../components/TimeTable';

const meta: Meta<typeof TimeTable> = {
  title: 'page/TimerPage/Components/TimeTable',
  component: TimeTable,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeTable>;

export const Default: Story = {
  args: {
    currIndex: 0,
    items: [
      {
        stance: 'PROS',
        type: 'OPENING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'CONS',
        type: 'OPENING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'NEUTRAL',
        type: 'TIME_OUT',
        time: 60,
      },
      {
        stance: 'CONS',
        type: 'CLOSING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'PROS',
        type: 'CLOSING',
        time: 60,
        speakerNumber: 1,
      },
    ],
  },
};

export const OtherIndex: Story = {
  args: {
    currIndex: 3,
    items: [
      {
        stance: 'PROS',
        type: 'OPENING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'CONS',
        type: 'OPENING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'NEUTRAL',
        type: 'TIME_OUT',
        time: 60,
      },
      {
        stance: 'CONS',
        type: 'CLOSING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'PROS',
        type: 'CLOSING',
        time: 60,
        speakerNumber: 1,
      },
    ],
  },
};

export const CustomTeamName: Story = {
  args: {
    titles: {
      pros: '짜장면',
      cons: '짬뽕',
    },
    currIndex: 0,
    items: [
      {
        stance: 'PROS',
        type: 'OPENING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'CONS',
        type: 'OPENING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'NEUTRAL',
        type: 'TIME_OUT',
        time: 60,
      },
      {
        stance: 'CONS',
        type: 'CLOSING',
        time: 60,
        speakerNumber: 1,
      },
      {
        stance: 'PROS',
        type: 'CLOSING',
        time: 60,
        speakerNumber: 1,
      },
    ],
  },
};
