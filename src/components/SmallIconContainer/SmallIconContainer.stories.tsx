import { Meta, StoryObj } from '@storybook/react';
import SmallIconButtonContainer from './SmallIconContainer';
import DTHome from '../icons/Home';

const meta: Meta<typeof SmallIconButtonContainer> = {
  title: 'components/SmallIconContainer',
  component: SmallIconButtonContainer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SmallIconButtonContainer>;

export const Default: Story = {
  args: {
    children: <DTHome className="size-16" />,
  },
};
