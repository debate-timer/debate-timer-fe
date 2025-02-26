import { useNavigate } from 'react-router-dom';

export default function AddTable() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/composition?mode=add`)}
      className="m-5 h-[243px] w-[500px] rounded-md bg-neutral-300 px-[40px] duration-200 hover:scale-105"
    >
      <h1 className="text-[50px] font-bold">+</h1>
    </button>
  );
}
