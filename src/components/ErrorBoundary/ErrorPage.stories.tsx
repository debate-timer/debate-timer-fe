import { Meta, StoryObj } from '@storybook/react';
import ErrorPage from './ErrorPage';
import { APIError } from '../../apis/primitives';

const meta: Meta<typeof ErrorPage> = {
  title: 'Components/ErrorPage',
  component: ErrorPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ErrorPage>;

export const Default: Story = {
  args: {
    error: new Error('샘플 오류 메시지'),
    stack: '샘플 오류 스택',
  },
};

export const OnAPIError: Story = {
  args: {
    error: new APIError('Internal Server Error', 500, null),
    stack: '샘플 오류 스택',
  },
};
