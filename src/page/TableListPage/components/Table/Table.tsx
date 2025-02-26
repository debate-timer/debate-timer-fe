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
      className="relative m-5 h-[243px] w-[500px] rounded-md bg-[#FECD4C] px-[40px] duration-200 hover:scale-105"
    >
      <div className="absolute right-[40px] top-[40px] flex flex-row space-x-2">
        <EditButton tableId={id} type={type} />
        <DeleteModalButton name={name} onDelete={onDelete} />
      </div>

      <div className="flex h-full flex-col items-start justify-center">
        <h1 className="mb-[30px] text-[40px] font-bold">{name}</h1>
        <div className="flex flex-col items-start justify-center text-[36px] font-bold">
          <span>유형 | {typeMapping[type]}</span>
          <span>
            시간 | {durationMinutes}분 {durationSeconds}초
          </span>
        </div>
      </div>
    </button>
  );
}
