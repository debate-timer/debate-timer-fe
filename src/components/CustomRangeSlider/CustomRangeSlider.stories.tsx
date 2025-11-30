// Storybook 코드
import { Meta, StoryObj } from '@storybook/react';
import CustomRangeSlider from './CustomRangeSlider';

const meta: Meta<typeof CustomRangeSlider> = {
  title: 'Components/CustomRangeSlider',
  component: CustomRangeSlider,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CustomRangeSlider>;

export const Default: Story = {
  args: {
    value: 5,
    max: 10,
    min: 0,
    onValueChange: (value: number) => {
      console.log(value);
    },
  },
};
