import { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useId } from 'react';
import Button from '../components/Button/Button';
import DialogModal from '../components/DialogModal/DialogModal';
import { useModal } from './useModal';

interface ModalPreviewProps {
  showCloseButton: boolean;
}

function ModalPreview(props: ModalPreviewProps) {
  const { showCloseButton } = props;
  const titleId = useId();
  const { openModal, closeModal, ModalWrapper } = useModal();
  useEffect(() => {
    openModal();
  }, [openModal]);

  return (
    <>
      <Button aria-label="모달 열기" onClick={openModal}>
        모달 열기
      </Button>
      <ModalWrapper showCloseButton={showCloseButton} aria-labelledby={titleId}>
        <div className="w-[calc(100vw-32px)] max-w-[500px]">
          <DialogModal
            left={
              showCloseButton
                ? undefined
                : { text: '취소', onClick: closeModal }
            }
            right={{ text: '확인', onClick: closeModal, isBold: true }}
          >
            <div className="flex flex-col gap-3 px-6 py-8 text-center">
              <h2 id={titleId} className="text-ui-title">
                변경 사항을 확인해 주세요
              </h2>
              <p className="text-ui-body text-neutral-600">
                닫기 버튼은 본문과 겹치지 않는 상단 영역에 표시됩니다.
              </p>
            </div>
          </DialogModal>
        </div>
      </ModalWrapper>
    </>
  );
}

const meta: Meta<typeof ModalPreview> = {
  title: 'hooks/useModal',
  component: ModalPreview,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, iframeHeight: 600 } },
  },
  tags: ['autodocs'],
  args: { showCloseButton: true },
};
export default meta;
type Story = StoryObj<typeof ModalPreview>;

export const WithCloseButton: Story = {};
export const WithCancelButton: Story = { args: { showCloseButton: false } };
