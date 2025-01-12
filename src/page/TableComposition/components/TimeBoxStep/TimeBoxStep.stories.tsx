import { Meta, StoryObj } from '@storybook/react';
import TimeBoxStep from './TimeBoxStep';

const meta: Meta<typeof TimeBoxStep> = {
  title: 'page/TimeBoxStep',
  component: TimeBoxStep,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeBoxStep>;

export const Default: Story = {};
