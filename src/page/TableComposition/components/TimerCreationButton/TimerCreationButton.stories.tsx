import { Meta, StoryObj } from '@storybook/react';
import TimerCreationButton from './TimerCreationButton';

const meta: Meta<typeof TimerCreationButton> = {
  title: 'page/TableSetup/Components/TimerCreationButton',
  component: TimerCreationButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimerCreationButton>;

export const Default: Story = {
  args: {
    leftOnClick: () => alert('Left button clicked!'),
    rightOnClick: () => alert('Right button clicked!'),
  },
};
