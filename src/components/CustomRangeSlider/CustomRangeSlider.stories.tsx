// Storybook 코드
import { Meta, StoryObj } from '@storybook/react-vite';
import CustomRangeSlider from './CustomRangeSlider';
import { useArgs } from 'storybook/preview-api';

const meta: Meta<typeof CustomRangeSlider> = {
  title: 'Components/CustomRangeSlider',
  component: CustomRangeSlider,
  tags: ['autodocs'],
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <CustomRangeSlider
        {...args}
        onValueChange={(value) => updateArgs({ value })}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof CustomRangeSlider>;

export const Default: Story = {
  args: {
    value: 5,
    max: 10,
    min: 0,
  },
};
