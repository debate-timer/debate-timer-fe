import { Meta, StoryObj } from '@storybook/react';
import SmallIconContainer from './SmallIconContainer';
import DTHome from '../icons/Home';

const meta: Meta<typeof SmallIconContainer> = {
  title: 'components/SmallIconContainer',
  component: SmallIconContainer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SmallIconContainer>;

export const Default: Story = {
  args: {
    children: <DTHome className="size-16" />,
  },
};
