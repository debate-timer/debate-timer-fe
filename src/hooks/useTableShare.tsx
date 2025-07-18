import { useModal } from './useModal';
import ShareModal from '../components/ShareModal/ShareModal';
import { useGetDebateTableData } from './query/useGetDebateTableData';
import { useEffect, useState } from 'react';
import { createTableShareUrl } from '../util/arrayEncoding';

export function useTableShare(tableId: number) {
  // Prepare variables, states and functions
  const { isOpen, openModal, closeModal, ModalWrapper } = useModal();
  const [copyState, setCopyState] = useState(false);
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

  // Fetch data
  const { data, isLoading, isError, refetch, isRefetching, isRefetchError } =
    useGetDebateTableData(tableId, isOpen);

  // Process URL when data is successfully fetched
  useEffect(() => {
    if (data) {
      setShareUrl(createTableShareUrl(baseUrl, data));
    }
  }, [baseUrl, data]);

  // Close indicator after 3 seconds
  // which tells user that URL is copied to clipboard
  useEffect(() => {
    if (copyState) {
      setTimeout(() => {
        setCopyState(false);
      }, 3000);
    }
  }, [copyState]);

  const TableShareModal = () =>
    isOpen ? (
      <ModalWrapper closeButtonColor="text-neutral-900">
        <ShareModal
          shareUrl={shareUrl}
          copyState={copyState}
          isLoading={isLoading || isRefetching}
          isError={isError || isRefetchError}
          onRefetch={() => refetch()}
          onCopyClicked={() => handleCopy()}
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
