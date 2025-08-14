import { Meta, StoryObj } from '@storybook/react';
import LabeledRadioButton from './LabeledRadioButton';

const meta: Meta<typeof LabeledRadioButton> = {
  title: 'Components/LabeledRadioButton',
  component: LabeledRadioButton,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
};

export default meta;

type Story = StoryObj<typeof LabeledRadioButton>;

export const Checked: Story = {
  args: {
    label: '체크박스 라벨 (Default)',
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    label: '체크박스 라벨 (Default)',
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: '체크박스 라벨 (Default)',
    checked: false,
    disabled: true,
  },
};

function LabeledRadioButtonTestPage() {
  return <div className="flex flex-row space-x-4"></div>;
}

export const SampleCode: Story = {
  render: () => <LabeledRadioButtonTestPage />,
};
