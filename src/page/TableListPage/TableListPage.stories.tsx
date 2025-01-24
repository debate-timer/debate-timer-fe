import { Meta, StoryObj } from '@storybook/react';
import TableListPage from './TableListPage';

const meta: Meta<typeof TableListPage> = {
  title: 'page/TableListPage',
  component: TableListPage,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TableListPage>;

export const Default: Story = {};
