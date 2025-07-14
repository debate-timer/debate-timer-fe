import { RiEditFill, RiDeleteBinFill } from 'react-icons/ri';
import { TimeBoxInfo } from '../../../../type/type';
import { useModal } from '../../../../hooks/useModal';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import DialogModal from '../../../../components/DialogModal/DialogModal';
import { FaPaste } from 'react-icons/fa';
interface TimeBoxManageButtonsEventHandlers {
  onSubmitEdit?: (updatedInfo: TimeBoxInfo) => void;
  onSubmitDelete?: () => void;
  onSubmitCopy?: () => void;
}
interface TimeBoxManageButtonsProps {
  info: TimeBoxInfo;
  prosTeamName: string;
  consTeamName: string;
  eventHandlers?: TimeBoxManageButtonsEventHandlers;
}

export default function TimeBoxManageButtons(props: TimeBoxManageButtonsProps) {
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
  const { info, eventHandlers } = props;
  const onSubmitEdit = eventHandlers?.onSubmitEdit;
  const onSubmitDelete = eventHandlers?.onSubmitDelete;
  const onSubmitCopy = eventHandlers?.onSubmitCopy;

  return (
    <>
      <div className="flex justify-end gap-2">
        {onSubmitCopy && (
          <button
            onClick={onSubmitCopy}
            className="rounded-sm bg-neutral-0 p-[2px]"
            aria-label="복사하기"
          >
            <FaPaste className="text-neutral-900" />
          </button>
        )}
        {onSubmitEdit && (
          <button
            onClick={openEditModal}
            className="rounded-sm bg-neutral-0 p-[2px]"
            aria-label="수정하기"
          >
            <RiEditFill className="text-neutral-900" />
          </button>
        )}
        {onSubmitDelete && (
          <button
            onClick={openDeleteModal}
            className="rounded-sm bg-neutral-0 p-[2px]"
            aria-label="삭제하기"
          >
            <RiDeleteBinFill className="text-neutral-900" />
          </button>
        )}
      </div>
      {onSubmitEdit && (
        <EditModalWrapper>
          <TimerCreationContent
            initData={info}
            prosTeamName={props.prosTeamName}
            consTeamName={props.consTeamName}
            onSubmit={(newInfo) => {
              onSubmitEdit(newInfo);
            }}
            onClose={closeEditModal}
          />
        </EditModalWrapper>
      )}

      {onSubmitDelete && (
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
              이 타이머를 삭제하시겠습니까?
            </h1>
          </DialogModal>
        </DeleteModalWrapper>
      )}
    </>
  );
}
