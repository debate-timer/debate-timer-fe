import { useTranslation } from 'react-i18next';
import { MdWifiOff } from 'react-icons/md';
import { motion } from 'framer-motion';

export type ChairmanStatusNoticeVariant = 'waiting' | 'absent';

interface ChairmanStatusNoticeProps {
  variant: ChairmanStatusNoticeVariant;
}

/**
 * 청중 화면에 사회자 연결 상태를 안내합니다.
 * - `waiting`: 타이머 위에 사회자 연결을 기다리는 중이라는 배너를 표시합니다.
 * - `absent`: 타이머 위를 덮는 반투명 오버레이로 사회자 연결이 끊겼음을 표시합니다.
 */
export default function ChairmanStatusNotice({
  variant,
}: ChairmanStatusNoticeProps) {
  const { t } = useTranslation();

  if (variant === 'waiting') {
    return (
      <div
        role="status"
        className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 xl:text-base"
      >
        <motion.span
          className="h-2 w-2 flex-shrink-0 rounded-full bg-gray-500"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <span className="break-keep">
          {t('사회자 연결을 기다리는 중이에요.')}
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/80 px-4 text-center backdrop-blur-[2px]"
    >
      <MdWifiOff
        className="h-12 w-12 text-gray-600 xl:h-16 xl:w-16"
        aria-hidden="true"
      />
      <p className="break-keep text-xl font-semibold text-gray-800 xl:text-2xl">
        {t('사회자 연결이 끊겼어요. 재접속을 기다리는 중이에요.')}
      </p>
    </div>
  );
}
