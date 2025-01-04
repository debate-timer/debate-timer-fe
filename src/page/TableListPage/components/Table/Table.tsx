import { useNavigate } from 'react-router-dom';
import { DebateTable } from '../../../../type/type';
import EditModalButton from '../Modal/EditModalButton';
import DeleteModalButton from '../Modal/DeleteModalButton';

interface DebateTableWithDelete extends DebateTable {
  onDelete: (name: string) => void;
}

export default function Table({
  name,
  type,
  time,
  onDelete,
}: DebateTableWithDelete) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      className="flex h-[200px] w-11/12 flex-col items-center rounded-md bg-amber-500 p-5 duration-200 hover:scale-105"
    >
      <div className="flex w-full justify-end gap-4 pb-2 lg:pb-0">
        <EditModalButton name={name} type={type} />
        <DeleteModalButton name={name} onDelete={onDelete} />
      </div>
      <h1 className="text-3xl font-semibold lg:text-5xl">{name}</h1>
      <div className="flex w-full flex-grow flex-col items-start justify-center text-lg font-semibold lg:text-2xl">
        <h1>유형 : {type}</h1>
        <h1>소요시간 : {time}분</h1>
      </div>
    </button>
  );
}
