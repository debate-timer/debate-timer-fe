import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiMicFill } from 'react-icons/ri';
import clsx from 'clsx';
import useMicCheck, {
  isMicCheckSupported,
  MIC_CHECK_DURATION_MS,
} from '../hooks/useMicCheck';
import { MicVerdict } from '../../../util/micLevel';

const VERDICT_CLASS: Record<MicVerdict, string> = {
  good: 'border-brand bg-brand/20',
  silent: 'border-semantic-error bg-semantic-error/10',
  quiet: 'border-semantic-warning bg-semantic-warning/10',
  clipping: 'border-semantic-error bg-semantic-error/10',
  noisy: 'border-semantic-warning bg-semantic-warning/10',
};

const formatDb = (db: number) =>
  Number.isFinite(db) && db > -100 ? `${Math.round(db)} dB` : '-';

// 동의한 뒤 기록을 시작하기 전에, 이 기기에서만 마이크 입력과 녹음 품질을 확인한다. 서버로 보내지 않는다.
export default function MicCheckPanel() {
  const { t } = useTranslation();
  const { status, level, remainingSec, result, recordingUrl, start, record } =
    useMicCheck();
  const isSupported = isMicCheckSupported();

  useEffect(() => {
    if (isSupported) {
      void start();
    }
  }, [isSupported, start]);

  const verdictMessages: Record<MicVerdict, string> = {
    good: t('품질이 좋아요. 들어보고 시작하세요.'),
    silent: t('소리가 안 들려요. 마이크를 확인해 주세요.'),
    quiet: t('소리가 작아요. 더 가까이서 말해 주세요.'),
    clipping: t('소리가 너무 커요. 조금 떨어져 주세요.'),
    noisy: t('주변 소음이 커요. 조용한 곳이 더 정확해요.'),
  };

  if (!isSupported || status === 'error') {
    return (
      <p className="text-sm text-default-black2">
        {isSupported
          ? t('마이크를 쓸 수 없어요. 권한을 확인해 주세요.')
          : t('마이크 테스트를 지원하지 않는 브라우저예요.')}
      </p>
    );
  }

  const isRecording = status === 'recording';
  const canRecord = status === 'ready' || status === 'done';
  const meterPercent = Math.round(level * 100);

  return (
    <div className="flex flex-col gap-3 text-left">
      <p className="text-sm leading-relaxed text-default-black2">
        {t('평소처럼 말해 보세요. 서버로 보내지 않아요.')}
      </p>

      <div className="flex items-center gap-3">
        <RiMicFill aria-hidden="true" className="size-5 shrink-0" />
        <div
          role="meter"
          aria-label={t('마이크 입력 크기')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={meterPercent}
          className="h-3 w-full overflow-hidden rounded-full bg-default-dim2"
        >
          <div
            className={clsx(
              'h-full rounded-full transition-[width] duration-75',
              level >= 0.98 ? 'bg-semantic-error' : 'bg-brand',
            )}
            style={{ width: `${meterPercent}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={record}
        disabled={!canRecord}
        className="w-full rounded-[12px] border-2 border-default-black px-4 py-2.5 text-sm font-bold hover:bg-default-dim2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'requesting' && t('마이크 연결 중...')}
        {isRecording &&
          t('녹음 중... {{count}}초 남음', { count: remainingSec })}
        {status === 'ready' &&
          t('{{count}}초 테스트 녹음', {
            count: MIC_CHECK_DURATION_MS / 1000,
          })}
        {status === 'done' && t('다시 테스트하기')}
      </button>

      {result && (
        <div
          aria-live="polite"
          className={clsx(
            'flex flex-col gap-2 rounded-[12px] border-2 px-4 py-3',
            VERDICT_CLASS[result.verdict],
          )}
        >
          <p className="text-sm font-semibold">
            {verdictMessages[result.verdict]}
          </p>
          <p className="text-xs text-default-black2">
            {t('말소리 {{speech}} · 배경 소음 {{noise}} · 차이 {{snr}}', {
              speech: formatDb(result.speechDb),
              noise: formatDb(result.noiseDb),
              snr: formatDb(result.snrDb),
            })}
          </p>
          {recordingUrl && (
            <audio
              controls
              src={recordingUrl}
              aria-label={t('테스트 녹음 듣기')}
              className="w-full"
            />
          )}
        </div>
      )}
    </div>
  );
}
