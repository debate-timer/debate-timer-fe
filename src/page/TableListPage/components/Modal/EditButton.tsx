import React from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
export default function EditModalButton({ tableId }: { tableId: number }) {
  const navigate = useNavigate();
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/composition?mode=edit&tableId=${tableId}`);
  };

  return (
    <>
      <button
        onClick={handleEdit}
        className="transform text-lg  duration-200 hover:scale-125 lg:text-2xl"
      >
        <AiOutlineEdit />
      </button>
    </>
  );
}
