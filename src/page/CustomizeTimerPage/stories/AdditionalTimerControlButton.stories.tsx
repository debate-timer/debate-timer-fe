import { Meta, StoryObj } from '@storybook/react';
import AdditionalTimerControlButton from '../components/AdditionalTimerControlButton';

const meta: Meta<typeof AdditionalTimerControlButton> = {
  title: 'page/CustomizeTimerPage/Components/AdditionalTimerControlButton',
  component: AdditionalTimerControlButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdditionalTimerControlButton>;

export const Default: Story = {
  args: {
    text: '+30초',
    addOnTimer: () => {},
  },
};
