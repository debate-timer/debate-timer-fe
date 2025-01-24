import { useNavigate } from 'react-router-dom';
export default function AddTable() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/composition?mode=add`)}
      className="flex h-[200px] w-11/12 items-center justify-center rounded-md bg-neutral-300 text-4xl font-bold duration-200 hover:scale-105"
    >
      +
    </button>
  );
}
