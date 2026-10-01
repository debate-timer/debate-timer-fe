import { Meta, StoryObj } from '@storybook/react';
import LiveShareButton from './LiveShareButton';

const meta: Meta<typeof LiveShareButton> = {
  title: 'page/TimerPage/components/LiveShareButton',
  component: LiveShareButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof LiveShareButton>;

export const Default: Story = {
  args: {
    onClick: () => {
      console.log('LiveShareButton clicked');
    },
  },
};

// 이 화면이 현재 라이브 공유 중인 사회자일 때
export const Sharing: Story = {
  args: {
    ...Default.args,
    isSharing: true,
  },
};
