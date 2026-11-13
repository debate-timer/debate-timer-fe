import { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import ToggleButton from './ToggleButton';

const META: Meta<typeof ToggleButton> = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  tags: ['autodocs'],
  args: { 'aria-label': '실시간 공유', isPressed: false },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <ToggleButton
        {...args}
        onPressedChange={(isPressed) => updateArgs({ isPressed })}
      />
    );
  },
};
export default META;
type Story = StoryObj<typeof ToggleButton>;
export const Default: Story = {};
export const On: Story = { args: { isPressed: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { disabled: true, isPressed: true } };
