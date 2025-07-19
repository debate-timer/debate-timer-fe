// Storybook 코드
import { Meta, StoryObj } from '@storybook/react';
import ClearableInput from './ClearableInput';

const meta: Meta<typeof ClearableInput> = {
  title: 'Components/ClearableInput',
  component: ClearableInput,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ClearableInput>;

export const Default: Story = {
  args: {
    value: 'Hello Storybook',
    onClear: () => alert('Clear clicked'),
    placeholder: 'Enter text...',
  },
};

export const Disabled: Story = {
  args: {
    value: 'Hello Storybook',
    onClear: () => alert('Clear clicked'),
    placeholder: 'Enter text...',
    disabled: true,
  },
};
