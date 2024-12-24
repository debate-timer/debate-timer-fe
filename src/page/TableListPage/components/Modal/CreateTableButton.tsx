import { useNavigate } from 'react-router-dom';

export default function CreateTableButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      className="h-[80px] w-full bg-amber-500 text-4xl font-semibold transition duration-300 hover:bg-red-300"
    >
      테이블 만들기
    </button>
  );
}
