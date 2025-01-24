import { Meta, StoryObj } from '@storybook/react';
import PropsAndConsTitle from './PropsAndConsTitle';

const meta: Meta<typeof PropsAndConsTitle> = {
  title: 'Components/PropsAndConsTitle',
  component: PropsAndConsTitle,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PropsAndConsTitle>;

export const Default: Story = {};
