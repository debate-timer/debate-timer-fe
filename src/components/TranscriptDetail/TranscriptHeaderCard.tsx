import { ReactNode } from 'react';

interface TranscriptHeaderCardProps {
  tableName: string;
  agenda: string;
  // 시간표 이름 옆에 붙는 칩(인식 방식 등)
  badge?: ReactNode;
}

// 대시보드 토론 기록 카드와 같은 차콜 카드로 기록의 시간표와 주제를 보여준다.
export default function TranscriptHeaderCard(props: TranscriptHeaderCardProps) {
  const { tableName, agenda, badge } = props;
  return (
    <div className="flex w-full flex-col gap-3 rounded-[28px] bg-default-black p-6 text-default-white shadow-lg md:p-8">
      <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-300">
        <span>{tableName}</span>
        {badge}
      </p>
      <span aria-hidden="true" className="size-[10px] bg-brand" />
      <h1 className="text-2xl leading-tight font-bold md:text-[32px]">
        {agenda}
      </h1>
    </div>
  );
}
