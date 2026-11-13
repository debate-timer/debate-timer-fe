import { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import LabeledRadioButton from './LabeledRadioButton';

const META: Meta<typeof LabeledRadioButton> = {
  title: 'Components/LabeledRadioButton',
  component: LabeledRadioButton,
  tags: ['autodocs'],
  args: {
    id: 'timer-option',
    name: 'timer-type',
    value: 'NORMAL',
    label: '일반 타이머',
    checked: false,
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    const id = useId();
    return (
      <LabeledRadioButton
        {...args}
        id={id}
        name={id}
        onChange={(event) => updateArgs({ checked: event.target.checked })}
      />
    );
  },
};

export default META;
type Story = StoryObj<typeof LabeledRadioButton>;

export const Checked: Story = { args: { checked: true } };
export const Unchecked: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
  args: { disabled: true, checked: true },
};
export const LongLabel: Story = {
  args: { label: '발언 시간을 자유롭게 나누어 사용하는 자유토론 타이머' },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
};

function RadioGroupSample() {
  const [selectedValue, setSelectedValue] = useState('NORMAL');
  const id = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-ui-label">타이머 종류</legend>
      {[
        { value: 'NORMAL', label: '일반 타이머' },
        { value: 'TIME_BASED', label: '자유토론 타이머' },
      ].map((option) => (
        <LabeledRadioButton
          key={option.value}
          id={`${id}-${option.value}`}
          name={id}
          value={option.value}
          label={option.label}
          checked={selectedValue === option.value}
          onChange={(event) => setSelectedValue(event.target.value)}
        />
      ))}
    </fieldset>
  );
}

export const SampleCode: Story = { render: () => <RadioGroupSample /> };
