import { useModal } from './useModal';
import ShareModal from '../components/ShareModal/ShareModal';
import { useGetDebateTableData } from './query/useGetDebateTableData';
import { useEffect, useState } from 'react';
import { createTableShareUrl } from '../util/arrayEncoding';

export function useTableShare(tableId: number) {
  const { isOpen, openModal, closeModal, ModalWrapper } = useModal();
  const [copyState, setCopyState] = useState(false);
  const [isUrlReady, setIsUrlReady] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const baseUrl =
    import.meta.env.MODE !== 'production'
      ? undefined
      : import.meta.env.VITE_SHARE_BASE_URL;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  const data = useGetDebateTableData(tableId, isOpen);

  useEffect(() => {
    if (data.data) {
      setShareUrl(createTableShareUrl(baseUrl, data.data));
      setIsUrlReady(true);
    }
  }, [baseUrl, data]);

  useEffect(() => {
    if (copyState) {
      setTimeout(() => {
        setCopyState(false);
      }, 3000);
    }
  });

  const TableShareModal = () =>
    isOpen ? (
      <ModalWrapper closeButtonColor="text-neutral-900">
        <ShareModal
          shareUrl={shareUrl}
          copyState={copyState}
          isUrlReady={isUrlReady}
          onClick={() => handleCopy()}
        />
      </ModalWrapper>
    ) : null;

  return {
    isShareOpen: isOpen,
    openShareModal: openModal,
    closeShareModal: closeModal,
    TableShareModal,
  };
}
