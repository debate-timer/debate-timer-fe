import { useTranslation } from 'react-i18next';
import { MdWifiOff } from 'react-icons/md';

interface ConnectionLostNoticeProps {
  onReload: () => void;
}

/**
 * 재연결 시도를 모두 소진해 스스로 복구할 수 없을 때, 보고 있던 화면 위에 새로고침을 안내합니다.
 * 마지막으로 받은 타이머를 지우지 않고 덮어, 청중이 어디까지 진행됐는지 잃지 않게 합니다.
 */
export default function ConnectionLostNotice({
  onReload,
}: ConnectionLostNoticeProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/80 px-4 text-center backdrop-blur-[2px]"
    >
      <MdWifiOff
        className="h-12 w-12 text-gray-600 xl:h-16 xl:w-16"
        aria-hidden="true"
      />
      <p className="break-keep text-xl font-semibold text-gray-800 xl:text-2xl">
        {t('서버 연결이 끊겼어요. 새로고침 해주세요.')}
      </p>
      <button
        type="button"
        className="rounded-lg bg-gray-800 px-6 py-3 text-lg font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        onClick={onReload}
      >
        {t('새로고침')}
      </button>
    </div>
  );
}
