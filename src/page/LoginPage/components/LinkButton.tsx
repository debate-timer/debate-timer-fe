import { useNavigate } from 'react-router-dom';
import { LinkButtonProps } from '../../../type/type';

export default function LinkButton({ url, title }: LinkButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(url);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-amber-300 p-5 rounded-lg hover:scale-105 transition-transform duration-200"
    >
      {title}
    </button>
  );
}
