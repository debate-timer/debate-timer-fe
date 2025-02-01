import { useNavigate } from 'react-router-dom';
import { DebateTable } from '../../../../type/type';
import EditButton from '../Modal/EditButton';
import DeleteModalButton from '../Modal/DeleteModalButton';
import { typeMapping } from '../../../../constants/languageMapping';
import { Formatting } from '../../../../util/formatting';

interface DebateTableWithDelete extends DebateTable {
  onDelete: (name: string) => void;
}

export default function Table({
  id,
  name,
  type,
  duration,
  onDelete,
}: DebateTableWithDelete) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/overview/${id}`);
  };

  const { minutes, seconds } = Formatting.formatSecondsToMinutes(duration);
  const [durationMinutes, durationSeconds] = [minutes, seconds].map(
    Formatting.formatTwoDigits,
  );

  return (
    <button
      onClick={handleClick}
      className="flex h-[200px] w-11/12 flex-col items-center rounded-md bg-amber-500 p-5 duration-200 hover:scale-105"
    >
      <div className="flex w-full justify-end gap-4 pb-2 lg:pb-0">
        <EditButton tableId={id} type={type} />
        <DeleteModalButton name={name} onDelete={onDelete} />
      </div>
      <h1 className="text-3xl font-semibold lg:text-5xl">{name}</h1>
      <div className="flex w-full flex-grow flex-col items-start justify-center text-lg font-semibold lg:text-2xl">
        <h1>유형 : {typeMapping[type]}</h1>
        <h1>
          소요시간 : {durationMinutes}분 {durationSeconds}초
        </h1>
      </div>
    </button>
  );
}
