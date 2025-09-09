// LabeledCheckbox.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import LabeledCheckBox from './LabeledCheckBox';

const meta: Meta<typeof LabeledCheckBox> = {
  title: 'Components/LabeledCheckBox',
  component: LabeledCheckBox,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof LabeledCheckBox>;

// 기본 스토리
export const Default: Story = {
  args: {
    label: '체크박스 라벨 (Default)',
    checked: false,
  },
};

// 체크된 상태
export const Checked: Story = {
  args: {
    label: '체크박스 라벨 (Checked)',
    checked: true,
  },
};

// 체크 해제 상태
export const Unchecked: Story = {
  args: {
    label: '체크박스 라벨 (Unchecked)',
    checked: false,
  },
};

// 비활성화 상태
export const Disabled: Story = {
  args: {
    label: '체크박스 라벨 (Disabled)',
    checked: false,
    disabled: true,
  },
};
