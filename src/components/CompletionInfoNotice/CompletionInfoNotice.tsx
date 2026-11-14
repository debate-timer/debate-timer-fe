import { useTranslation } from 'react-i18next';

interface CompletionInfoNoticeProps {
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
}

/** 정보 조회 실패가 완료·종료 안내를 가리지 않도록 지역 복구를 제공함. */
export default function CompletionInfoNotice(props: CompletionInfoNoticeProps) {
  const { isError, isFetching, onRetry } = props;
  const { t } = useTranslation();
  if (!isError) {
    return null;
  }
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-center gap-3 p-4 text-ui-caption text-neutral-700"
    >
      <p>{t('토론 정보를 불러오지 못했습니다.')}</p>
      <button
        type="button"
        aria-label={t('정보 다시 불러오기')}
        disabled={isFetching}
        onClick={onRetry}
        className="min-h-11 rounded-xl border border-neutral-300 px-3"
      >
        {t('정보 다시 불러오기')}
      </button>
    </div>
  );
}
