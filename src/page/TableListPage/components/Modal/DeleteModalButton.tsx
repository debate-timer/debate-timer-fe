import { AiOutlineDelete } from 'react-icons/ai';
import { useModal } from '../../../../hooks/useModal';

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
        <div className="flex flex-col items-center">
          <h1 className="px-20 pb-4 pt-10 text-xl font-bold">
            삭제하시겠습니까?
          </h1>
          <div className="flex flex-row items-center justify-center space-x-2 pb-10">
            <p className="text-sm">테이블 이름</p>
            <p className="text-sm font-semibold">{name}</p>
          </div>

          <div className="w-full border-t border-neutral-300" />
          <div className="flex w-full flex-row items-center justify-center py-4">
            <button className="w-1/2" onClick={() => closeModal()}>
              <p className="w-full text-brand-sub2">취소</p>
            </button>
            <button className="w-1/2" onClick={() => handleDelete()}>
              <p className="w-full font-bold text-brand-sub2">삭제</p>
            </button>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
