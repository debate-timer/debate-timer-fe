import React, { Fragment } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { useModal } from '../../../../hooks/useModal';

export default function EditModalButton() {
  const { openModal, closeModal, ModalWrapper } = useModal();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal();
  };

  return (
    <Fragment>
      <button
        onClick={handleEdit}
        className="transform text-lg  duration-200 hover:scale-125 lg:text-2xl"
      >
        <AiOutlineEdit />
      </button>
      <ModalWrapper>
        <div>hi!</div>
      </ModalWrapper>
    </Fragment>
  );
}
