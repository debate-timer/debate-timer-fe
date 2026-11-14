import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderFrame from './HeaderFrame';
import HeaderDebateInfo from './HeaderDebateInfo';

interface TimerHeaderProps {
  name?: string | null;
  agenda?: string | null;
  isGuest?: boolean;
  actions?: ReactNode;
}
const LAYOUT_CLASS =
  'flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between';

/** 기본·피드백·사회자 투표의 정보와 페이지가 조립한 조작 슬롯을 표시함. */
export default function TimerHeader(props: TimerHeaderProps) {
  const { name, agenda, isGuest = false, actions } = props;
  const { t } = useTranslation();
  return (
    <HeaderFrame>
      <div className={LAYOUT_CLASS}>
        <div className="min-w-0 md:flex-1">
          <HeaderDebateInfo name={name} agenda={agenda} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {isGuest && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-ui-caption">
              {t('비회원 모드')}
            </span>
          )}
          {actions}
        </div>
      </div>
    </HeaderFrame>
  );
}
