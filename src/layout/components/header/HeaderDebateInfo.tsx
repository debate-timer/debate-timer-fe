import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface HeaderDebateInfoProps {
  name?: string | null;
  agenda?: string | null;
}

const BUTTON_CLASS =
  'w-full min-w-0 rounded-lg text-start focus-visible:outline-2 focus-visible:outline-offset-2';
const EXPANDED_CLASS =
  'max-h-[40dvh] overflow-y-auto break-words whitespace-pre-wrap';

/** 이름은 보조·주제는 주요 정보로 표시하고 키보드·터치로 전체 내용을 펼침. */
export default function HeaderDebateInfo(props: HeaderDebateInfoProps) {
  const { name, agenda } = props;
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();
  return (
    <button
      type="button"
      className={BUTTON_CLASS}
      aria-label={t(isExpanded ? '토론 정보 접기' : '토론 정보 펼치기')}
      aria-expanded={isExpanded}
      aria-controls={contentId}
      onClick={() => setIsExpanded((current) => !current)}
    >
      <span
        id={contentId}
        className={clsx('block', isExpanded && EXPANDED_CLASS)}
      >
        <span
          className={clsx(
            'block text-ui-caption text-neutral-600',
            !isExpanded && 'truncate',
          )}
        >
          {name?.trim() ? name : t('시간표 이름 없음')}
        </span>
        <span
          className={clsx('block text-ui-title', !isExpanded && 'truncate')}
        >
          {agenda?.trim() ? agenda : t('주제 없음')}
        </span>
      </span>
    </button>
  );
}
