import { Meta, StoryObj } from '@storybook/react';
import CompactTimeoutTimer from '../components/CompactTimeoutTimer';

const meta: Meta<typeof CompactTimeoutTimer> = {
  title: 'page/TimerPage/Components/CompactTimeoutTimer',
  component: CompactTimeoutTimer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CompactTimeoutTimer>;

export const Default: Story = {
  args: {
    onClose: () => {
      console.log('# Close button clicked.');
    },
  },
};
