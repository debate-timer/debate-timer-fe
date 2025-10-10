import clsx from 'clsx';
import { TEAM_STYLE, TeamKey } from '../../../type/type';

interface VoteTeamButtonProps {
  label: string;
  name: string;
  teamkey: TeamKey;
  selectedTeam: TeamKey | null;
  isSelected: boolean;
  onSelect: () => void;
}

export default function VoteTeamButton({
  label,
  name,
  teamkey,
  isSelected,
  selectedTeam,
  onSelect,
}: VoteTeamButtonProps) {
  const style = TEAM_STYLE[teamkey];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'flex w-full max-w-[320px] flex-1 flex-col items-center justify-center',
        'rounded-[32px] border-[3px] px-8 py-8 text-center',
        'transition-transform duration-150 hover:scale-[1.02] focus:outline-none',
        'md:aspect-square md:gap-2',
        // 조건 변경
        isSelected || selectedTeam === null
          ? [style.baseBg, style.baseBorder]
          : 'border-neutral-300 bg-default-disabled/hover',
      )}
      aria-pressed={isSelected}
    >
      <span
        className={clsx(
          'text-lg font-semibold md:text-2xl',
          isSelected || selectedTeam === null ? style.label : 'text-white',
        )}
      >
        {label}
      </span>
      <span
        className={clsx(
          'mt-2 text-3xl font-bold md:text-5xl',
          isSelected || selectedTeam === null ? style.name : 'text-white',
        )}
      >
        {name}
      </span>
    </button>
  );
}
