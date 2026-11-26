import { useId, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoLinkSharp } from 'react-icons/io5';
import Button from '../../../components/Button/Button';
import { copyToClipboard } from '../../../util/clipboard';

interface ShareLinkControlProps {
  shareUrl: string;
  placement: 'menu' | 'dialog';
}

/** URL별로 마운트해 이전 링크의 복사 결과가 새 주소에 표시되지 않게 한다. */
export default function ShareLinkControl(props: ShareLinkControlProps) {
  const { shareUrl, placement } = props;
  const { t } = useTranslation();
  const id = useId();
  const [feedback, setFeedback] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const request = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(
    () => () => {
      request.current += 1;
      clearTimeout(timeout.current);
    },
    [],
  );
  const handleCopy = async () => {
    const current = ++request.current;
    clearTimeout(timeout.current);
    const copied = await copyToClipboard(shareUrl);
    if (request.current !== current) return;
    setFeedback(copied ? 'copied' : 'failed');
    if (copied) timeout.current = setTimeout(() => setFeedback('idle'), 2000);
  };
  const inDialog = placement === 'dialog';
  const addressVisible = !inDialog || feedback === 'failed';
  const copyLabel = feedback === 'copied' ? t('복사 완료') : t('링크 복사');
  return (
    <div className="min-w-0">
      {addressVisible && (
        <label htmlFor={id} className="mb-1 block text-ui-label">
          {t('청중 입장 링크')}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {addressVisible && (
          <input
            id={id}
            value={shareUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-12 min-w-24 flex-1 form-control-border bg-white px-3 text-ui-body"
          />
        )}
        <Button
          variant={inDialog ? 'primary' : 'secondary'}
          shape="rounded"
          className={inDialog ? 'max-sm:px-3' : undefined}
          aria-label={copyLabel}
          aria-live="polite"
          onClick={() => void handleCopy()}
        >
          {inDialog && <IoLinkSharp aria-hidden />}
          {copyLabel}
        </Button>
      </div>
      <p
        className="text-ui-caption text-neutral-700 empty:hidden"
        role="status"
      >
        {feedback === 'failed' && t('주소를 선택해 복사해 주세요.')}
      </p>
    </div>
  );
}
