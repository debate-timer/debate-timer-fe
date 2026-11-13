import { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import ClearableInput from './ClearableInput';

const META: Meta<typeof ClearableInput> = {
  title: 'Components/ClearableInput',
  component: ClearableInput,
  tags: ['autodocs'],
  args: {
    'aria-label': '토론 주제',
    value: '우리의 토론 주제',
    placeholder: '토론 주제를 입력해주세요',
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-md pb-16">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <ClearableInput
        {...args}
        onChange={(event) => updateArgs({ value: event.target.value })}
        onClear={
          args.onClear === undefined
            ? () => updateArgs({ value: '' })
            : args.onClear
        }
      />
    );
  },
};

export default META;
type Story = StoryObj<typeof ClearableInput>;

export const Default: Story = {};
export const Empty: Story = { args: { value: '' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithoutClear: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <ClearableInput
        {...args}
        onChange={(event) => updateArgs({ value: event.target.value })}
      />
    );
  },
};
export const ErrorBorder: Story = { args: { isError: true } };
export const WithCounter: Story = { args: { maxCount: 20 } };
export const AtLimit: Story = { args: { value: '가나다라마', maxCount: 5 } };
export const OverLimit: Story = {
  args: { value: '가나다라마바', maxCount: 5 },
};
export const Error: Story = {
  args: {
    id: 'topic-error',
    isError: true,
    errorMessage: '토론 주제를 확인해주세요.',
  },
};
export const ErrorWithCounter: Story = {
  args: {
    id: 'topic-error-counter',
    value: '가나다라마바',
    maxCount: 5,
    isError: true,
    errorMessage: '주제는 5자 이내로 입력해주세요.',
  },
};
export const LongValue: Story = {
  args: {
    value:
      '긴 토론 주제를 입력해도 삭제 버튼과 입력문이 겹치지 않는지 확인합니다.',
  },
};

export const LongErrorWithNextInput: Story = {
  render: (args) => (
    <div className="flex w-60 flex-col gap-3">
      <ClearableInput
        {...args}
        readOnly
        isError
        maxCount={20}
        errorMessage="Please enter a shorter topic so everyone can read the complete description of the debate."
      />
      <ClearableInput value="다음 입력" readOnly aria-label="다음 입력" />
    </div>
  ),
};
