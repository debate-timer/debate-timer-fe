import { Meta, StoryObj } from '@storybook/react';
import DecisionButton from './DecisionButton';

const meta: Meta<typeof DecisionButton> = {
  title: 'Components/DecisionButton',
  component: DecisionButton,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DecisionButton>;

export const Enabled: Story = {
  args: {
    children: '테이블 저장하기',
    onClick: () => {},
  },
};

export const Disabled: Story = {
  args: {
    children: '테이블 저장하기',
    enabled: false,
    onClick: () => {},
  },
};
