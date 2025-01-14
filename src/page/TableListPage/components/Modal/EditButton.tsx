import React from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { Type } from '../../../../type/type';
interface EditButtonProps {
  tableId: number;
  type?: Type;
}
export default function EditButton({ tableId, type }: EditButtonProps) {
  const navigate = useNavigate();
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/composition?mode=edit&tableId=${tableId}&type=${type}`);
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
