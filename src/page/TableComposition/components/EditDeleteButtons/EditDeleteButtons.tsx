import { RiEditFill, RiDeleteBinFill } from 'react-icons/ri';
import { ParliamentaryTimeBoxInfo } from '../../../../type/type';
import { useModal } from '../../../../hooks/useModal';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import DialogModal from '../../../../components/DialogModal/DialogModal';

interface EditDeleteButtonsPros {
  info: ParliamentaryTimeBoxInfo;
  onSubmitEdit: (updatedInfo: ParliamentaryTimeBoxInfo) => void;
  onSubmitDelete: () => void;
}

export default function EditDeleteButtons(props: EditDeleteButtonsPros) {
  const {
    openModal: openEditModal,
    closeModal: closeEditModal,
    ModalWrapper: EditModalWrapper,
  } = useModal({ isCloseButtonExist: false });
  const {
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
    ModalWrapper: DeleteModalWrapper,
  } = useModal({ isCloseButtonExist: false });
  const { info, onSubmitEdit, onSubmitDelete } = props;

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          onClick={openEditModal}
          className="rounded-sm bg-neutral-0 p-[2px]"
          aria-label="수정하기"
        >
          <RiEditFill className="text-neutral-900" />
        </button>
        <button
          onClick={openDeleteModal}
          className="rounded-sm bg-neutral-0 p-[2px]"
          aria-label="삭제하기"
        >
          <RiDeleteBinFill className="text-neutral-900" />
        </button>
      </div>
      <EditModalWrapper>
        <TimerCreationContent
          initData={info}
          onSubmit={(newInfo) => {
            onSubmitEdit(newInfo);
          }}
          onClose={closeEditModal}
        />
      </EditModalWrapper>
      <DeleteModalWrapper>
        <DialogModal
          left={{ text: '취소', onClick: () => closeDeleteModal() }}
          right={{
            text: '삭제',
            onClick: () => {
              onSubmitDelete();
              closeDeleteModal();
            },
            isBold: true,
          }}
        >
          <h1 className="px-20 py-10 text-xl font-bold">
            이 순서를 삭제하시겠습니까?
          </h1>
        </DialogModal>
      </DeleteModalWrapper>
    </>
  );
}
