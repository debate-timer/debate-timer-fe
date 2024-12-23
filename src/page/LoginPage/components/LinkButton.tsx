import { useNavigate } from 'react-router-dom';

export default function LinkButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/table');
  };

  return (
    <button onClick={handleClick} className="bg-amber-300 p-5 rounded-lg">
      로그인
    </button>
  );
}
