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
