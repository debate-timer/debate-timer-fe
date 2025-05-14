import { Meta, StoryObj } from '@storybook/react';
import ShareModal from './ShareModal';

const meta: Meta<typeof ShareModal> = {
  title: 'components/ShareModal',
  component: ShareModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ShareModal>;

export const Default: Story = {
  args: {
    shareUrl: 'https://www.naver.com',
  },
};
