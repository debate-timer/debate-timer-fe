import { Meta, StoryObj } from '@storybook/react';
import NotFoundPage from './NotFoundPage';

const meta: Meta<typeof NotFoundPage> = {
  title: 'Components/NotFoundPage',
  component: NotFoundPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NotFoundPage>;

export const Default: Story = {};
