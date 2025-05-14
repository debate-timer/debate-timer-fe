import { Meta, StoryObj } from '@storybook/react';
import ShareModal from './ShareModal';

const meta: Meta<typeof ShareModal> = {
  title: 'components/ShareModal',
  component: ShareModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ShareModal>;

export const OnQRCodeReady: Story = {
  args: {
    shareUrl: 'https://www.naver.com',
    copyState: false,
    isUrlReady: true,
    onClick: () => {},
  },
};

export const OnLoadingData: Story = {
  args: {
    shareUrl: '',
    copyState: false,
    isUrlReady: false,
    onClick: () => {},
  },
};
