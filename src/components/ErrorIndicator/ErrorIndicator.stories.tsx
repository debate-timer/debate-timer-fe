import { Meta, StoryObj } from '@storybook/react';
import ErrorIndicator from './ErrorIndicator';

const meta: Meta<typeof ErrorIndicator> = {
  title: 'Components/ErrorIndicator',
  component: ErrorIndicator,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ErrorIndicator>;

export const Default: Story = {
  args: {
    children: '오류가 발생했어요.',
  },
};

export const OnRetryButtonEnabled: Story = {
  args: {
    children: '오류가 발생했어요. 다시 시도하시겠어요?',
    onClickRetry: () => {},
  },
};
