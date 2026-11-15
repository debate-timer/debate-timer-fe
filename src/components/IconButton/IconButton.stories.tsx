import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import IconButton from './IconButton';
import DTEdit from '../icons/Edit';

const META: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: {
    icon: <DTEdit aria-hidden="true" />,
    'aria-label': '수정하기',
    variant: 'neutral',
    onClick: fn(),
  },
  argTypes: {
    shape: { control: 'select', options: ['squircle', 'rounded', 'circle'] },
  },
};
export default META;
type Story = StoryObj<typeof IconButton>;

export const Rounded: Story = {};
export const Squircle: Story = { args: { shape: 'squircle' } };
export const Circle: Story = { args: { shape: 'circle' } };
export const Large: Story = { args: { size: 'large' } };
export const Disabled: Story = { args: { disabled: true } };
export const Shapes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      {(['squircle', 'rounded', 'circle'] as const).map((shape) => (
        <div key={shape} className="flex flex-col items-center gap-3">
          <span>{shape}</span>
          <IconButton {...args} shape={shape} />
          <IconButton
            {...args}
            shape={shape}
            size="large"
            variant="secondary"
          />
          <IconButton {...args} shape={shape} disabled />
        </div>
      ))}
    </div>
  ),
};
