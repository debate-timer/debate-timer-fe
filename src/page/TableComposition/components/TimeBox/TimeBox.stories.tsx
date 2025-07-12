import { Meta, StoryObj } from '@storybook/react';
import TimeBox from './TimeBox';

const meta: Meta<typeof TimeBox> = {
  title: 'page/TableSetup/Components/TimeBox',
  component: TimeBox,
  tags: ['autodocs'],
  args: {
    info: {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimeBox>;

// 찬성 입론
export const ProsOpening: Story = {
  args: {
    info: {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
    },
  },
};

// 반대 반론
export const ConsRebuttal: Story = {
  args: {
    info: {
      stance: 'CONS',
      speechType: '반론',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
    },
  },
};

// 중립 작전 시간
export const NeutralTimeout: Story = {
  args: {
    info: {
      stance: 'NEUTRAL',
      speechType: '작전시간',
      boxType: 'NORMAL',
      time: 120,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1번',
    },
  },
};

// 자유토론
export const NeutralCustom: Story = {
  args: {
    info: {
      stance: 'NEUTRAL',
      speechType: '자유토론',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 120,
      timePerSpeaking: 60,
      speaker: null,
    },
  },
};
