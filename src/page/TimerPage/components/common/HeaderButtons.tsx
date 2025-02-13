import { IoMdHome } from 'react-icons/io';
import { IoHelpCircle, IoLogOut } from 'react-icons/io5';

interface HeaderButtonsProps {
  onClickHome: () => void;
  onClickHelp: () => void;
  onClickLogout: () => void;
}

export default function HeaderButtons({
  onClickHome,
  onClickHelp,
  onClickLogout,
}: HeaderButtonsProps) {
  return (
    <div className="flex flex-row justify-end space-x-2">
      <button
        onClick={() => onClickHome()}
        className="rounded-full bg-slate-300 px-2 py-2 font-bold text-zinc-900 hover:bg-zinc-400"
      >
        <IoMdHome size={24} />
      </button>

      <button
        onClick={() => onClickHelp()}
        className="rounded-full bg-slate-300 px-2 py-2 font-bold text-zinc-900 hover:bg-zinc-400"
      >
        <IoHelpCircle size={24} />
      </button>
      <button
        onClick={() => onClickLogout()}
        className="rounded-full bg-slate-300 px-2 py-2 font-bold text-zinc-900 hover:bg-zinc-400"
      >
        <IoLogOut size={24} />
      </button>
    </div>
  );
}
