import { motion } from 'framer-motion';
import CountUp from './CountUp';
import { TEAM_STYLE, TeamKey } from '../../../type/type';

type VoteBarProps = {
  teamKey: TeamKey; // "PROS" | "CONS"
  teamName: string; // "단비" / "청춘예찬"
  count: number; // 득표 수
  total: number; // 전체 인원
  heightClass?: string; // h-20 등 높이 조절용
};

export default function VoteBar({
  teamKey,
  teamName,
  count,
  total,
  heightClass = 'h-20',
}: VoteBarProps) {
  const style = TEAM_STYLE[teamKey];
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const sideLabel = teamKey === 'PROS' ? '찬성팀' : '반대팀';

  // 배경 바 색상은 좀 더 투명하게
  const barTone =
    teamKey === 'PROS'
      ? 'bg-[#C2E8FF]' // 찬성(파랑)
      : 'bg-[#FFC7D3]'; // 반대(빨강)

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100`}
    >
      {/* 배경 퍼센트바 */}
      <motion.div
        className={`absolute inset-y-0 left-0 ${barTone} rounded-r-2xl`}
        initial={{ width: '0%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        aria-hidden
      />

      {/* 텍스트 영역 */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <div className="flex min-w-0 flex-col">
          <span className={`text-sm font-semibold ${style.label}`}>
            {sideLabel}
          </span>
          <span className={`truncate text-xl font-extrabold ${style.name}`}>
            {teamName}
          </span>
        </div>

        <div className="shrink-0 pl-4 text-2xl font-extrabold text-neutral-900">
          <CountUp to={count} />명
        </div>
      </div>
    </div>
  );
}
