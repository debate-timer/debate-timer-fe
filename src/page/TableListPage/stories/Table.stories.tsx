import { Meta, StoryObj } from '@storybook/react';
import Table from '../components/Table';

const meta: Meta<typeof Table> = {
  title: 'page/TableListPage/Components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Parliamentary: Story = {
  args: {
    agenda: '인간을 위한 동물 실험은 금지되어야 한다.',
    name: '테이블 30',
    type: 'PARLIAMENTARY',
    onDelete: () => {},
    onEdit: () => {},
  },
};

export const Customize: Story = {
  args: {
    agenda: '인간을 위한 동물 실험은 금지되어야 한다.',
    name: '테이블 30',
    type: 'PARLIAMENTARY',
    onDelete: () => {},
    onEdit: () => {},
  },
};
