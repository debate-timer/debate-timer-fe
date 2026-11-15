import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Stance } from '../../../types/type';

interface AudienceStanceBadgeProps {
  stance: Stance;
}

const STANCE_LABEL: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
};
const STANCE_BACKGROUND: Record<Stance, string> = {
  PROS: 'bg-stance-blue/10',
  CONS: 'bg-stance-red/10',
  NEUTRAL: 'bg-neutral-100',
};
const STANCE_MARKER: Record<Stance, string> = {
  PROS: 'bg-stance-blue',
  CONS: 'bg-stance-red',
  NEUTRAL: 'bg-neutral-500',
};
const BADGE_CLASS =
  'inline-flex max-w-full shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full px-3 py-1 text-ui-caption text-neutral-900 md:px-4 md:py-2 md:text-ui-label';

/**
 * 청중 타이머에서 공유하는 진영 배지. 작은 화면에서도 진영 이름과 색상을 표시한다.
 */
export default function AudienceStanceBadge(props: AudienceStanceBadgeProps) {
  const { stance } = props;
  const { t } = useTranslation();

  return (
    <span className={clsx(BADGE_CLASS, STANCE_BACKGROUND[stance])}>
      <span
        className={clsx('h-2 w-2 shrink-0 rounded-full', STANCE_MARKER[stance])}
        aria-hidden="true"
      />
      <span>{t(STANCE_LABEL[stance])}</span>
    </span>
  );
}
