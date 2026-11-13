import { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import LabeledCheckBox from './LabeledCheckBox';

const META: Meta<typeof LabeledCheckBox> = {
  title: 'Components/LabeledCheckBox',
  component: LabeledCheckBox,
  tags: ['autodocs'],
  args: { label: '토론 진행 알림 받기', checked: false },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <LabeledCheckBox
        {...args}
        onChange={(event) => updateArgs({ checked: event.target.checked })}
      />
    );
  },
};
export default META;
type Story = StoryObj<typeof LabeledCheckBox>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Unchecked: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
  args: { checked: true, disabled: true },
};
export const LongLabel: Story = {
  args: {
    label:
      '토론 참여자 모두에게 진행 상황과 다음 발언 순서에 대한 알림을 전달합니다.',
  },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
};
export const WithDescription: Story = {
  args: {
    label: (
      <span className="flex flex-col gap-1">
        <span>토론 진행 알림 받기</span>
        <span className="text-ui-caption text-neutral-500">
          다음 발언 순서를 안내합니다.
        </span>
      </span>
    ),
  },
};
