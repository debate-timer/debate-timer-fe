import { Meta, StoryObj } from '@storybook/react';
import AddTable from '../Table/AddTable';

const meta: Meta<typeof AddTable> = {
  title: 'page/TableListPage/Components/AddTable',
  component: AddTable,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AddTable>;

export const Default: Story = {};
