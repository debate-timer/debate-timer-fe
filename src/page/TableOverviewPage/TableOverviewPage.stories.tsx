import { Meta, StoryObj } from '@storybook/react';
import TableOverviewPage from './TableOverviewPage';
import {
  // ParliamentaryTimeBoxInfo,
  TimeBoxInfo,
} from '../../type/type';

// 1) 메타 설정
const meta: Meta<typeof TableOverviewPage> = {
  title: 'page/TableOverviewPage',
  component: TableOverviewPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TableOverviewPage>;

// 2) 스토리 정의
export const Default: Story = {
  parameters: {
    routeState: [
      {
        stance: 'PROS',
        speechType: '입론',
        boxType: 'NORMAL',
        time: 120,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: '발언자 1',
      },
      {
        stance: 'PROS',
        speechType: '입론',
        boxType: 'NORMAL',
        time: 120,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: '발언자 1',
      },
      {
        stance: 'NEUTRAL',
        speechType: '작전 시간',
        boxType: 'NORMAL',
        time: 60,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: null,
      },
    ] as TimeBoxInfo[],
  },
};
