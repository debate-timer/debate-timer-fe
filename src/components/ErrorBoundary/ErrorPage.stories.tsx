import { Meta, StoryObj } from '@storybook/react';
import ErrorPage from './ErrorPage';

const meta: Meta<typeof ErrorPage> = {
  title: 'Components/ErrorPage',
  component: ErrorPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ErrorPage>;

export const Default: Story = {
  args: {
    message: '샘플 오류 메시지',
    stack: '샘플 오류 스택',
  },
};
