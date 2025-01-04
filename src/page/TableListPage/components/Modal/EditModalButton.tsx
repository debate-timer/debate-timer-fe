import React from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { useModal } from '../../../../hooks/useModal';
import EditTableModal from './EditTableModal';

export default function EditModalButton({
  name,
  type,
}: {
  name: string;
  type: string;
}) {
  const { openModal, ModalWrapper } = useModal();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal();
  };

  return (
    <>
      <button
        onClick={handleEdit}
        className="transform text-lg  duration-200 hover:scale-125 lg:text-2xl"
      >
        <AiOutlineEdit />
      </button>
      <ModalWrapper>
        <EditTableModal name={name} type={type} />
      </ModalWrapper>
    </>
  );
}
