import { RiEditFill, RiDeleteBinFill } from 'react-icons/ri';
import DeleteConfirmContent from '../DeleteConfirmContent/DeleteConfirmContent';
import { TimeBoxInfo } from '../../../../type/type';
import { useModal } from '../../../../hooks/useModal';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';

interface EditDeleteButtonsPros {
  info: TimeBoxInfo;
  onSubmitEdit: (updatedInfo: TimeBoxInfo) => void;
  onSubmitDelete: () => void;
}

export default function EditDeleteButtons(props: EditDeleteButtonsPros) {
  const {
    openModal: openEditModal,
    closeModal: closeEditModal,
    ModalWrapper: EditModalWrapper,
  } = useModal();
  const {
    openModal: deleteOpenModal,
    closeModal: deleteCloseModal,
    ModalWrapper: DeleteModalWrapper,
  } = useModal();
  const { info, onSubmitEdit, onSubmitDelete } = props;

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          onClick={openEditModal}
          className="rounded-sm bg-neutral-0"
          aria-label="수정하기"
        >
          <RiEditFill className="text-neutral-900" />
        </button>
        <button
          onClick={deleteOpenModal}
          className="rounded-sm bg-neutral-0"
          aria-label="삭제하기"
        >
          <RiDeleteBinFill className="text-neutral-900" />
        </button>
      </div>
      <EditModalWrapper>
        <TimerCreationContent
          selectedStance={info.stance}
          initDate={info}
          onSubmit={(newInfo) => {
            onSubmitEdit(newInfo);
          }}
          onClose={closeEditModal}
        />
      </EditModalWrapper>
      <DeleteModalWrapper>
        <DeleteConfirmContent
          onDelete={onSubmitDelete}
          onClose={deleteCloseModal}
        />
      </DeleteModalWrapper>
    </>
  );
}
