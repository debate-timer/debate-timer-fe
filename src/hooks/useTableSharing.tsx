import { QRCodeSVG } from 'qrcode.react';
import { CustomizeTimeBoxInfo } from '../type/type';
import { createEncodedURL } from '../util/arrayEncoding';
import { useModal } from './useModal';

export function useTableSharing(tables: CustomizeTimeBoxInfo[]) {
  const { isOpen, openModal, closeModal, ModalWrapper } = useModal();
  const baseUrl =
    import.meta.env.MODE !== 'production'
      ? undefined
      : import.meta.env.VITE_API_BASE_URL;
  const shareUrl = createEncodedURL(baseUrl, tables);
  const QRCode = () => {
    <QRCodeSVG value={baseUrl} />;
  };
  const SharingModal = () => {
    <div></div>;
  };
}
