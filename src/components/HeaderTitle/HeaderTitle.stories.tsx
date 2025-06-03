import { Meta, StoryObj } from '@storybook/react';
import HeaderTitle from './HeaderTitle';

const meta: Meta<typeof HeaderTitle> = {
  title: 'Components/HeaderTitle',
  component: HeaderTitle,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof HeaderTitle>;

export const OnLoggedIn: Story = {
  args: {
    title: '제목',
    isGuestMode: false,
  },
};

export const OnGuestMode: Story = {
  args: {
    title: '제목',
    isGuestMode: true,
  },
};
