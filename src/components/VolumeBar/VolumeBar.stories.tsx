import { Meta, StoryObj } from '@storybook/react';
import VolumeBar from './VolumeBar';

const meta: Meta<typeof VolumeBar> = {
  title: 'components/VolumeBar',
  component: VolumeBar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof VolumeBar>;

export const Default: Story = {
  args: {
    volume: 0,
    onVolumeChange: (delta: number) => console.log(delta),
  },
};
