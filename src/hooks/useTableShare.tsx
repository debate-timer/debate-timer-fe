import { useModal } from './useModal';
import ShareModal from '../components/ShareModal/ShareModal';
import { useGetDebateTableData } from './query/useGetDebateTableData';
import { useEffect, useState } from 'react';
import { createTableShareUrl } from '../util/arrayEncoding';

export function useTableShare(tableId: number) {
  const { isOpen, openModal, closeModal, ModalWrapper } = useModal();
  const [copyState, setCopyState] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const baseUrl = import.meta.env.VITE_SHARE_BASE_URL;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    refetch,
    isRefetching,
    isRefetchError,
  } = useGetDebateTableData(tableId, isOpen);
  const isLoading = isFetching || isRefetching;
  const isError = isFetchError || isRefetchError;

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
          isLoading={isLoading}
          isError={isError}
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
