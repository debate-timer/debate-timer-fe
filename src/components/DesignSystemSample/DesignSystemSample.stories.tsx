import { Meta, StoryObj } from '@storybook/react';
import DesignSystemSample from './DesignSystemSample';

const meta: Meta<typeof DesignSystemSample> = {
  title: 'components/DesignSystemSample',
  component: DesignSystemSample,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DesignSystemSample>;

export const Default: Story = {
  args: {},
};
