import { Meta, StoryObj } from '@storybook/react';
import DebatePanel from './DebatePanel';

const meta: Meta<typeof DebatePanel> = {
  title: 'page/TableSetup/Components/DebatePanel',
  component: DebatePanel,
  tags: ['autodocs'],
  args: {
    info: {
      stance: 'PROS',
      type: 'OPENING',
      time: 150,
      speakerNumber: 1,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DebatePanel>;

// 찬성 입론
export const ProsOpening: Story = {
  args: {
    info: {
      stance: 'PROS',
      type: 'OPENING',
      time: 150,
      speakerNumber: 1,
    },
  },
};

// 반대 반론
export const ConsRebuttal: Story = {
  args: {
    info: {
      stance: 'CONS',
      type: 'REBUTTAL',
      time: 120,
      speakerNumber: 2,
    },
  },
};

// 중립 작전 시간
export const NeutralTimeout: Story = {
  args: {
    info: {
      stance: 'NEUTRAL',
      type: 'TIME_OUT',
      time: 60,
      speakerNumber: 0,
    },
  },
};
