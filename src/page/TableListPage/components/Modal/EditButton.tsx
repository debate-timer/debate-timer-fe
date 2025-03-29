import React from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { DebateType } from '../../../../type/type';
interface EditButtonProps {
  tableId: number;
  type?: DebateType;
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
        className="transform text-2xl duration-200 hover:scale-125"
        aria-label="수정하기"
      >
        <AiOutlineEdit />
      </button>
    </>
  );
}
