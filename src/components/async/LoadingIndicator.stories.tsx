import { Meta, StoryObj } from '@storybook/react';
import LoadingIndicator from './LoadingIndicator';

const meta: Meta<typeof LoadingIndicator> = {
  title: 'Components/async/LoadingIndicator',
  component: LoadingIndicator,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {
  args: {
    message: '로딩 중...',
  },
};
