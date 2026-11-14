import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RecordingConsentDialog from './RecordingConsentDialog';

const meta: Meta<typeof RecordingConsentDialog> = {
  title: 'page/AudienceSharePage/components/RecordingConsentDialog',
  component: RecordingConsentDialog,
  tags: ['autodocs'],
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof RecordingConsentDialog>;

export const Default: Story = {};
