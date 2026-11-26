import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { IoQrCodeSharp } from 'react-icons/io5';
import Button from '../../../components/Button/Button';
import ShareLinkControl from './ShareLinkControl';

interface LiveShareQrPanelProps {
  shareUrl: string;
}

const QR_FRAME_CLASS =
  'isolate mx-auto w-[min(calc(100vw-6rem),max(11rem,calc(100dvh-184px)))] rounded-2xl border border-neutral-200 bg-neutral-100 p-3';

/** 화면에서는 QR 배경을 프레임 색과 합성하고, 다운로드한 PNG에는 흰 여백을 유지한다. */
export default function LiveShareQrPanel(props: LiveShareQrPanelProps) {
  const { shareUrl } = props;
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDownloadError, setHasDownloadError] = useState(false);

  const handleDownloadImage = () => {
    setHasDownloadError(false);
    try {
      const png = canvasRef.current?.toDataURL('image/png');
      if (!png?.startsWith('data:image/png;')) {
        setHasDownloadError(true);
        return;
      }
      const link = document.createElement('a');
      link.href = png;
      link.download = 'debate-timer-qr.png';
      document.body.append(link);
      try {
        link.click();
      } finally {
        link.remove();
      }
    } catch {
      setHasDownloadError(true);
    }
  };

  return (
    <div className="max-w-[calc(100vw-2rem)] space-y-4 px-4 pt-2 pb-3 text-center text-ui-body text-neutral-900">
      <div className="px-4">
        <div className={QR_FRAME_CLASS}>
          <QRCodeCanvas
            value={shareUrl}
            ref={canvasRef}
            size={1024}
            bgColor="#ffffff"
            fgColor="#000000"
            marginSize={4}
            className="mix-blend-multiply"
            style={{ width: '100%', height: 'auto' }}
            aria-label={t('실시간 공유 QR 코드')}
            role="img"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-2">
        <ShareLinkControl shareUrl={shareUrl} placement="dialog" />
        <Button
          shape="rounded"
          variant="primary"
          className="max-sm:px-3"
          aria-label={t('QR 이미지 다운로드')}
          onClick={handleDownloadImage}
        >
          <IoQrCodeSharp aria-hidden />
          {t('QR 이미지 다운로드')}
        </Button>
      </div>
      {hasDownloadError && (
        <p role="alert" className="text-ui-caption text-red-800">
          {t('QR 이미지를 다운로드하지 못했어요. 링크를 복사해 주세요.')}
        </p>
      )}
    </div>
  );
}
