import { Meta, StoryObj } from '@storybook/react';
import LoginPage from './LoginPage';

const meta: Meta<typeof LoginPage> = {
  title: 'page/LoginPage',
  component: LoginPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};
