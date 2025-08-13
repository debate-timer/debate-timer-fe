import { Meta, StoryObj } from '@storybook/react';
import TimerCreationContent from './TimerCreationContent';

const meta: Meta<typeof TimerCreationContent> = {
  title: 'page/TableComposition/Components/TimerCreationContent',
  component: TimerCreationContent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimerCreationContent>;

export const Default: Story = {
  args: {},
};
