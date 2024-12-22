import { Meta, StoryObj } from '@storybook/react';
import PropsAndConsTitle from './PropsAndConsTitle';

const meta: Meta<typeof PropsAndConsTitle> = {
  title: 'page/TableSetup/Components/PropsAndConsTitle',
  component: PropsAndConsTitle,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PropsAndConsTitle>;

// 기본 렌더링
export const Default: Story = {};
