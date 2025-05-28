import { Meta, StoryObj } from '@storybook/react';
import EditDeleteButtons from './EditDeleteButtons';
import { TimeBoxInfo } from '../../../../type/type';

const meta: Meta<typeof EditDeleteButtons> = {
  title: 'page/TableSetup/components/EditDeleteButtons',
  component: EditDeleteButtons,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof EditDeleteButtons>;

const normalTimeBoxInfo: TimeBoxInfo = {
  stance: 'PROS',
  speechType: '교차 조사',
  boxType: 'NORMAL',
  time: 120,
  speaker: '김철수 토론자',
  timePerSpeaking: null,
  timePerTeam: null,
};

export const NormalTimeBox: Story = {
  args: {
    info: normalTimeBoxInfo,
    onSubmitEdit: () => {},
    onSubmitDelete: () => {},
  },
};

const timeBasedTimeBoxInfo: TimeBoxInfo = {
  stance: 'NEUTRAL',
  speechType: '자유토론',
  boxType: 'TIME_BASED',
  time: null,
  speaker: null,
  timePerSpeaking: 120,
  timePerTeam: 480,
};

export const TimeBasedTimeBox: Story = {
  args: {
    info: timeBasedTimeBoxInfo,
    onSubmitEdit: () => {},
    onSubmitDelete: () => {},
  },
};
