import { Meta, StoryObj } from '@storybook/react';
import DropdownForDebateType from './DropdownForDebateType';

const meta: Meta<typeof DropdownForDebateType> = {
  title: 'page/TableCompositon/Components/DropdownForDebateType',
  component: DropdownForDebateType,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DropdownForDebateType>;

export const Default: Story = {};
