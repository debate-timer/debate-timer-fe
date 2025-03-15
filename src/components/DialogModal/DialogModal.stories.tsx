import { Meta, StoryObj } from '@storybook/react';
import DialogModal from './DialogModal';

const meta: Meta<typeof DialogModal> = {
  title: 'components/DialogModal',
  component: DialogModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DialogModal>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex flex-col items-center space-y-2 px-10 py-6">
        <h1 className="text-xl font-bold">변경 사항을 적용하시겠습니까?</h1>
        <h1>알림 끄기 → 알림 켜기</h1>
      </div>
    ),
    leftText: '취소',
    rightText: '적용',
    onLeftClick: () => {},
    onRightClick: () => {},
    isLeftBold: false,
    isRightBold: true,
  },
};
