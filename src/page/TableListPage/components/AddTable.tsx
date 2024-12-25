import { useState } from 'react';
import CreateTableModal from './Modal/CreateTableModal';
import { useModal } from '../../../hooks/useModal';

export default function AddTable() {
  const { openModal, closeModal, ModalWrapper } = useModal();

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex h-[200px] w-[500px] items-center justify-center rounded-md bg-neutral-300 text-4xl font-bold duration-200 hover:scale-105"
      >
        +
      </button>
      <CreateTableModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
