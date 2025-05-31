import { Meta, StoryObj } from '@storybook/react';
import LoginAndStoreDBModal from './LoginAndStoreDBModal';

const meta: Meta<typeof LoginAndStoreDBModal> = {
  title: 'components/LoginAndStoreDBModal',
  component: LoginAndStoreDBModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoginAndStoreDBModal>;

// When QR code is ready
export const OnQRCodeReady: Story = {
  args: {
    onConfirm: () => {},
    onDecline: () => {},
  },
};
