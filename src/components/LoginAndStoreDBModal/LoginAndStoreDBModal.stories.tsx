import { Meta, StoryObj } from '@storybook/react';
import LoginAndStoreDBModal from './LoginAndStoreDBModal';

const meta: Meta<typeof LoginAndStoreDBModal> = {
  title: 'components/LoginAndStoreDBModal',
  component: LoginAndStoreDBModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoginAndStoreDBModal>;

// When QR code is ready
export const HeaderButton: Story = {
  args: {
    children: (
      <>
        비회원으로 사용하던 데이터가 있습니다. <br />
        로그인 후에도 이 데이터를 계속 사용하시겠습니까?
      </>
    ),
    onSaveAndLogin: () => {},
    onOnlyLogin: () => {},
  },
};

export const FinishDebate: Story = {
  args: {
    children: (
      <>
        토론을 끝내셨군요! <br />
        지금까지의 토론을 저장할까요?
      </>
    ),
    onSaveAndLogin: () => {},
    onOnlyLogin: () => {},
  },
};
