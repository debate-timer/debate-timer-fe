import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import DeleteConfirmContent from '../DeleteConfirmContent/DeleteConfirmContent';
import { DebateInfo } from '../../../../type/type';
import { useModal } from '../../../../hooks/useModal';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';

interface EditDeleteButtonsPros {
  info: DebateInfo;
  onSubmitEdit: (updatedInfo: DebateInfo) => void;
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
        <button onClick={openEditModal} aria-label="수정하기">
          <AiOutlineEdit />
        </button>
        <button onClick={deleteOpenModal} aria-label="삭제하기">
          <AiOutlineDelete />
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
