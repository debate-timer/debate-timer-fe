import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { useModal } from '../../../../hooks/useModal';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import { DebateInfo } from '../../../../type/type';

interface EditDeleteButtonsPros {
  info: DebateInfo;
  onSubmitEdit: (updatedInfo: DebateInfo) => void;
  onSubmitDelete: () => void;
}

export default function EditDeleteButtons(props: EditDeleteButtonsPros) {
  const { openModal, closeModal, ModalWrapper } = useModal();
  const { info, onSubmitEdit, onSubmitDelete } = props;
  return (
    <>
      <div className="flex w-full justify-end gap-2">
        <button onClick={openModal}>
          <AiOutlineEdit />
        </button>
        <button>
          <AiOutlineDelete onClick={onSubmitDelete} />
        </button>
      </div>
      <ModalWrapper>
        <TimerCreationContent
          selectedStance={info.stance}
          initDate={info}
          onSubmit={(newInfo) => {
            onSubmitEdit(newInfo);
          }}
          onClose={closeModal}
        />
        ,
      </ModalWrapper>
    </>
  );
}
