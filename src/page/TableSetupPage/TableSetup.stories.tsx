import { Meta, StoryObj } from '@storybook/react';
import TableSetup from './TableSetup';

const meta: Meta<typeof TableSetup> = {
  title: 'page/TableSetup',
  component: TableSetup,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TableSetup>;

export const Default: Story = {};
