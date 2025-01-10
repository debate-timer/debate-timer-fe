import { Meta, StoryObj } from '@storybook/react';
import TableOverview from './TableOverview';
import { DebateInfo } from '../../type/type';

// 1) 메타 설정
const meta: Meta<typeof TableOverview> = {
  title: 'page/TableOverview',
  component: TableOverview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableOverview>;

// 2) 스토리 정의
export const Default: Story = {
  parameters: {
    routeState: [
      {
        stance: 'PROS',
        type: 'OPENING',
        time: 150,
        speakerNumber: 1,
      },
      {
        stance: 'CONS',
        type: 'REBUTTAL',
        time: 180,
        speakerNumber: 2,
      },
    ] as DebateInfo[],
  },
};
