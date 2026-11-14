import { ReactNode } from 'react';
import HeaderFrame from './HeaderFrame';
import HeaderDebateInfo from './HeaderDebateInfo';
import BrandLink from './BrandLink';

interface AudienceHeaderProps {
  name?: string | null;
  agenda?: string | null;
  actions?: ReactNode;
}
const LAYOUT_CLASS =
  'flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3';

/** 청중 정보·언어·로그인 슬롯만 제공하며 사회자 조작은 받지 않음. */
export default function AudienceHeader(props: AudienceHeaderProps) {
  const { name, agenda, actions } = props;
  return (
    <HeaderFrame>
      <div className={LAYOUT_CLASS}>
        <BrandLink />
        <div className="order-3 w-full min-w-0 md:order-none md:w-auto md:flex-1">
          <HeaderDebateInfo name={name} agenda={agenda} />
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>
    </HeaderFrame>
  );
}
