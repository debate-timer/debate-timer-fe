import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import DialogModal from './DialogModal';

const meta: Meta<typeof DialogModal> = {
  title: 'components/DialogModal',
  component: DialogModal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[calc(100vw-32px)] max-w-[500px]">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <div className="flex flex-col gap-3 px-6 py-8 text-center">
        <h2 className="text-ui-title">변경 사항을 적용하시겠습니까?</h2>
        <p className="text-ui-body text-neutral-600">알림 끄기 → 알림 켜기</p>
      </div>
    ),
    left: { text: '취소', onClick: fn() },
    right: { text: '적용', onClick: fn(), isBold: true },
  },
};

export default meta;
type Story = StoryObj<typeof DialogModal>;

export const Default: Story = {};
export const SingleRightButton: Story = { args: { left: undefined } };
export const SingleLeftButton: Story = { args: { right: undefined } };
export const WithoutButtons: Story = {
  args: { left: undefined, right: undefined },
};
export const LongContent: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-3 px-6 py-8 text-center">
        <h2 className="text-ui-title">
          공유받은 토론 시간표를 저장하시겠어요?
        </h2>
        <p className="text-ui-body text-neutral-600">
          저장하면 내 시간표 목록에서 다시 열어 수정할 수 있습니다. 저장하지
          않고 진행할 수도 있습니다. 원하는 진행 방법을 선택해 주세요.
        </p>
      </div>
    ),
    left: { text: '비회원 상태로 토론하기', onClick: fn() },
    right: { text: '내 시간표에 저장하기', onClick: fn(), isBold: true },
  },
};
export const NarrowWidth: Story = {
  args: LongContent.args,
  decorators: [
    (Story) => (
      <div className="w-[288px]">
        <Story />
      </div>
    ),
  ],
};
