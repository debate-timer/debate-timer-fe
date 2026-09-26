import { MdHourglassTop } from 'react-icons/md';
import { motion } from 'framer-motion';

interface DebateWaitingNoticeProps {
  message: string;
}

/**
 * 사회자가 토론을 공유하기 전까지 청중 화면에 토론 시작 대기 안내를 표시합니다.
 * 모래시계를 천천히 뒤집어 화면이 멈춘 것이 아니라 기다리는 중임을 알립니다.
 */
export default function DebateWaitingNotice({
  message,
}: DebateWaitingNoticeProps) {
  return (
    <div
      role="status"
      className="flex h-full w-full flex-col items-center justify-center gap-6"
    >
      <motion.div
        data-testid="audience-waiting-icon"
        animate={{ rotate: [0, 0, 180, 180] }}
        transition={{
          duration: 2.4,
          times: [0, 0.6, 0.85, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      >
        <MdHourglassTop className="h-16 w-16 text-gray-500 xl:h-20 xl:w-20" />
      </motion.div>
      <h1 className="break-keep px-4 text-center text-2xl font-bold text-gray-800 xl:text-4xl">
        {message}
      </h1>
    </div>
  );
}
