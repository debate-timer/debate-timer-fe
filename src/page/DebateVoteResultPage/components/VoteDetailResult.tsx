// pages/VoteDetailResult.tsx
import { motion } from 'framer-motion';
import VoteBar from './VoteBar';

type VoteDetailResultProps = {
  onGoHome?: () => void;
  pros: { name: string; count: number };
  cons: { name: string; count: number };
};

export default function VoteDetailResult({
  onGoHome,
  pros,
  cons,
}: VoteDetailResultProps) {
  return (
    <main className="flex items-center justify-center bg-white">
      <motion.section
        className="relative w-[min(92vw,560px)] overflow-hidden rounded-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* 내용 */}
        <div className="px-6 pb-8 pt-10">
          <h2 className="mb-6 text-center text-[min(max(1.25rem,2.4vw),1.6rem)]">
            투표 세부 결과
          </h2>

          <div className="flex flex-col gap-4">
            <VoteBar
              teamKey="PROS"
              teamName={pros.name}
              count={pros.count}
              total={pros.count + cons.count}
            />
            <VoteBar
              teamKey="CONS"
              teamName={cons.name}
              count={cons.count}
              total={pros.count + cons.count}
            />
          </div>
        </div>

        {/* 하단 CTA 바 */}
        <button
          onClick={onGoHome}
          className="flex w-full items-center justify-center bg-brand py-4 transition hover:opacity-90"
        >
          <div
            onClick={onGoHome}
            className="flex items-center text-lg font-bold text-default-black"
          >
            홈으로 돌아가기
          </div>
        </button>
      </motion.section>
    </main>
  );
}
