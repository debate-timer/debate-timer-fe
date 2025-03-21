import { Meta, StoryObj } from '@storybook/react';
import TableComposition from './TableComposition';

const meta: Meta<typeof TableComposition> = {
  title: 'page/TableCompositon',
  component: TableComposition,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TableComposition>;

export const Default: Story = {};
