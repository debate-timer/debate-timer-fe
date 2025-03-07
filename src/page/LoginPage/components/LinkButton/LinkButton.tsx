import { useNavigate } from 'react-router-dom';

interface LinkButtonProps {
  url: string;
  title: string;
}

export default function LinkButton({ url, title }: LinkButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(url);
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg bg-amber-300 p-5 font-semibold transition-transform duration-200 hover:scale-105"
    >
      {title}
    </button>
  );
}
