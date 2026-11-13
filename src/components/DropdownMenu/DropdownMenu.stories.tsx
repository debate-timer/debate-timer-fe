import { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import DropdownMenu from './DropdownMenu';
import ClearableInput from '../ClearableInput/ClearableInput';

const OPTIONS = [
  { value: 'NORMAL', label: '입론' },
  { value: 'REBUTTAL', label: '반론' },
  { value: 'CUSTOM', label: '직접 입력' },
];

const META: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  args: {
    options: OPTIONS,
    selectedValue: 'NORMAL',
    placeholder: '발언 유형을 선택해주세요',
    'aria-label': '발언 유형',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl pb-72">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <DropdownMenu
        {...args}
        onSelect={(selectedValue) => updateArgs({ selectedValue })}
      />
    );
  },
};
export default META;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {};
export const OnSelected: Story = { args: { selectedValue: 'REBUTTAL' } };
export const Placeholder: Story = { args: { selectedValue: null } };
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { options: [], selectedValue: null } };
export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 30 }, (_, index) => ({
      value: index,
      label: `발언 유형 ${index + 1}`,
    })),
    selectedValue: 24,
  },
};
export const LongLabels: Story = {
  args: {
    options: [
      {
        value: 'LONG',
        label:
          '참여자들이 자유롭게 의견을 교환하고 토론을 마무리하는 최종 발언',
      },
      { value: 'SHORT', label: '입론' },
    ],
    selectedValue: 'LONG',
  },
};
export const BooleanValues: Story = {
  args: {
    options: [
      { value: true, label: '사용' },
      { value: false, label: '사용 안 함' },
    ],
    selectedValue: false,
  },
};
export const WithInput: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <div className="flex flex-wrap items-start gap-4">
        <DropdownMenu
          {...args}
          className="min-w-48 flex-1"
          onSelect={(selectedValue) => updateArgs({ selectedValue })}
        />
        <ClearableInput
          aria-label="발언 유형 직접 입력"
          value="직접 입력한 발언 유형"
          readOnly
          className="min-w-48 flex-1"
        />
      </div>
    );
  },
};
