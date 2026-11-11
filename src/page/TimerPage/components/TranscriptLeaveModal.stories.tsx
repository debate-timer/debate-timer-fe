import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import TranscriptLeaveModal from './TranscriptLeaveModal';

const meta: Meta<typeof TranscriptLeaveModal> = {
  title: 'page/TimerPage/components/TranscriptLeaveModal',
  component: TranscriptLeaveModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TranscriptLeaveModal>;

export const Default: Story = {};
