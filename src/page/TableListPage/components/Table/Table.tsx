import { useNavigate } from 'react-router-dom';
import { DebateTable, DebateTypeToString } from '../../../../type/type';
import EditButton from '../Modal/EditButton';
import DeleteModalButton from '../Modal/DeleteModalButton';

interface DebateTableWithDelete extends DebateTable {
  onDelete: (name: string) => void;
}

export default function Table({
  id,
  name,
  type,
  agenda,
  onDelete,
}: DebateTableWithDelete) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/overview/${type.toLowerCase()}/${id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="relative m-5 h-[243px] w-[500px] rounded-md bg-[#FECD4C] px-[40px] text-left duration-200 hover:scale-105"
    >
      <div className="absolute right-[40px] top-[40px] flex flex-row space-x-2">
        <EditButton tableId={id} type={type} />
        <DeleteModalButton name={name} onDelete={onDelete} />
      </div>

      <div className="flex h-full flex-col items-start justify-center">
        <h1 className="mb-[30px] text-[40px] font-bold">{name}</h1>
        <div className="flex max-w-full flex-col items-start justify-center text-[36px] font-bold">
          <span>유형 | {DebateTypeToString[type]}</span>
          <span
            className="w-full truncate"
            title={agenda && agenda?.length > 15 ? agenda : undefined}
          >
            주제 | {agenda || '주제 없음'}
          </span>
        </div>
      </div>
    </button>
  );
}
