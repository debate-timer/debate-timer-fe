import { Meta, StoryObj } from '@storybook/react-vite';
import Skeleton from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {},
};
