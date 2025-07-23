import { TimeBoxInfo } from '../../../../type/type';
import { useModal } from '../../../../hooks/useModal';
import TimerCreationContent from '../TimerCreationContent/TimerCreationContent';
import DialogModal from '../../../../components/DialogModal/DialogModal';
import SmallIconContainer from '../../../../components/SmallIconContainer/SmallIconContainer';
import DTCopy from '../../../../components/icons/Copy';
import DTEdit from '../../../../components/icons/Edit';
import DTDelete from '../../../../components/icons/Delete';
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
          <button onClick={onSubmitCopy} aria-label="복사하기">
            <SmallIconContainer className="size-[28px] p-[8px]">
              <DTCopy className="h-full" />
            </SmallIconContainer>
          </button>
        )}
        {onSubmitEdit && (
          <button onClick={openEditModal} aria-label="수정하기">
            <SmallIconContainer className="size-[28px] p-[8px]">
              <DTEdit className="h-full" />
            </SmallIconContainer>{' '}
          </button>
        )}
        {onSubmitDelete && (
          <button onClick={openDeleteModal} aria-label="삭제하기">
            <SmallIconContainer className="size-[28px] p-[8px]">
              <DTDelete className="h-full" />
            </SmallIconContainer>{' '}
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
