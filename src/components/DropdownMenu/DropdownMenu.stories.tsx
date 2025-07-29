import { Meta, StoryObj } from '@storybook/react';
import DropdownMenu, { DropdownMenuItem } from './DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

const booleanOptions: DropdownMenuItem<boolean>[] = [
  { value: true, label: '참' },
  { value: false, label: '거짓' },
];

export const Default: Story = {
  args: {
    disabled: false,
    onSelect: () => {},
    options: booleanOptions,
    placeholder: '선택',
    selectedValue: '',
  },
};

export const OnSelected: Story = {
  args: {
    disabled: false,
    onSelect: () => {},
    options: booleanOptions,
    placeholder: '선택',
    selectedValue: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onSelect: () => {},
    options: booleanOptions,
    placeholder: '선택',
    selectedValue: false,
  },
};
