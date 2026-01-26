import { Meta, StoryObj } from '@storybook/react';
import UpdateModal from './UpdateModal';

const meta: Meta<typeof UpdateModal> = {
  title: 'components/UpdateModal',
  component: UpdateModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UpdateModal>;

export const Default: Story = {
  args: {
    title: '피드백 & 투표',
    description:
      '토론 종료 후 피드백 & 투표 기능으로\n다양한 서비스를 이용하세요!',
  },
};
