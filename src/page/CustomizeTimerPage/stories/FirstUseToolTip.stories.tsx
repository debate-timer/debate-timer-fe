import { Meta, StoryObj } from '@storybook/react';
import FirstUseToolTip from '../components/FirstUseToolTip';

const meta: Meta<typeof FirstUseToolTip> = {
  title: 'page/CustomizeTimerPage/Components/FirstUseToolTip',
  component: FirstUseToolTip,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FirstUseToolTip>;

export const Default: Story = {
  args: {
    onClose: () => {
      console.log('# Close button clicked.');
    },
  },
};
