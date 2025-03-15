import { AiOutlineDelete } from 'react-icons/ai';
import { useModal } from '../../../../hooks/useModal';
import DialogModal from '../../../../components/DialogModal/DialogModal';

export default function DeleteModalButton({
  name,
  onDelete,
}: {
  name: string;
  onDelete: (name: string) => void;
}) {
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal();
  };

  const handleDelete = () => {
    onDelete(name);
    closeModal();
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="transform text-2xl duration-200 hover:scale-125"
        aria-label="삭제하기"
      >
        <AiOutlineDelete />
      </button>
      <ModalWrapper>
        <DialogModal
          leftText="취소"
          rightText="삭제"
          onLeftClick={() => closeModal()}
          onRightClick={() => handleDelete()}
          isRightBold={true}
        >
          <div className="flex flex-col items-center space-y-2 px-20 py-10">
            <h1 className="text-xl font-bold">삭제하시겠습니까?</h1>
            <div className="flex flex-row items-center space-x-2">
              <h1 className="text-sm">테이블 이름</h1>
              <h1 className="text-sm font-semibold">{name}</h1>
            </div>
          </div>
        </DialogModal>
      </ModalWrapper>
    </>
  );
}
