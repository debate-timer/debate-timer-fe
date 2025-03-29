import { Meta, StoryObj } from '@storybook/react';
import Table from '../components/Table';

const meta: Meta<typeof Table> = {
  title: 'page/TableListPage_new',
  component: Table,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    agenda: '인간을 위한 동물 실험은 금지되어야 한다.',
    id: 0,
    name: '테이블 30',
    type: 'PARLIAMENTARY',
  },
};
