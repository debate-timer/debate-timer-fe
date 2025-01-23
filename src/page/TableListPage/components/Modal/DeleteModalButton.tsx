import { AiOutlineDelete } from 'react-icons/ai';
import { useModal } from '../../../../hooks/useModal';

export default function DeleteModalButton({
  name,
  onDelete,
}: {
  name: string;
  onDelete: (name: string) => void;
}) {
  const { openModal, closeModal, ModalWrapper } = useModal();

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
        className="transform text-lg duration-200 hover:scale-125  lg:text-2xl"
        aria-label="삭제하기"
      >
        <AiOutlineDelete />
      </button>
      <ModalWrapper>
        <div className="flex flex-col items-center gap-6 px-12 py-8">
          <h1 className="text-xl font-bold">삭제하시겠습니까?</h1>
          <h2 className="text-lg font-semibold">테이블명: {name}</h2>
          <button
            className="mt-8 rounded-lg bg-red-500 px-8 py-2 text-white"
            onClick={handleDelete}
          >
            삭제
          </button>
        </div>
      </ModalWrapper>
    </>
  );
}
