import { Meta, StoryObj } from '@storybook/react';
import LoadingIndicator from './LoadingIndicator';

const meta: Meta<typeof LoadingIndicator> = {
  title: 'Components/LoadingIndicator',
  component: LoadingIndicator,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {
  args: {
    children: '로딩 중...',
  },
};
