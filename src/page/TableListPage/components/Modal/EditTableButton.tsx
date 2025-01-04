import { useNavigate } from 'react-router-dom';

export default function EditTableButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      className="h-[80px] w-full bg-amber-500 text-4xl font-semibold transition duration-300 hover:bg-amber-600"
    >
      테이블 수정하기
    </button>
  );
}
