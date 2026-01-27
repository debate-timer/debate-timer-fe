import { useTranslation } from 'react-i18next';
import crown from '../../../assets/debateEnd/crown.svg';
import { TEAM_STYLE, TeamKey } from '../../../type/type';
import clsx from 'clsx';

interface WinnerCardProps {
  teamkey: TeamKey | null; // "PROS" | "CONS" | null
  teamName: string; // 예: "단비" 또는 "무승부"
}

export default function WinnerCard({ teamkey, teamName }: WinnerCardProps) {
  const { t } = useTranslation();
  const style = teamkey ? TEAM_STYLE[teamkey] : null;
  const sideLabel =
    teamkey === 'PROS'
      ? t('찬성팀')
      : teamkey === 'CONS'
        ? t('반대팀')
        : t('무승부');

  return (
    <div className="relative flex items-center justify-center py-10">
      {/* 카드 */}
      <div
        className={clsx(
          'relative mt-6 flex h-[280px] w-[280px] items-center justify-center rounded-[32px] border-2',
          teamkey
            ? [style?.baseBg, style?.baseBorder]
            : ['bg-default-disabled/hover', 'border-neutral-300'],
        )}
      >
        <div className="text-center">
          <p
            className={clsx(
              'text-lg font-semibold',
              teamkey ? style?.label : 'text-neutral-600',
            )}
          >
            {sideLabel}
          </p>
          <p
            className={clsx(
              'mt-3 text-4xl font-extrabold tracking-tight',
              teamkey ? style?.name : 'text-neutral-700',
            )}
          >
            {teamName}
          </p>
        </div>
      </div>

      {/* 왕관 — 무승부일 때는 표시 안 함 */}
      {teamkey && (
        <div className="absolute -top-16 flex flex-col items-center">
          <img src={crown} alt={t('왕관')} className="h-40 w-40" />
        </div>
      )}
    </div>
  );
}
