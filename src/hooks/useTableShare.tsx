import { CustomizeTimeBoxInfo } from '../type/type';
import { createEncodedURL } from '../util/arrayEncoding';
import { useModal } from './useModal';
import ShareModal from '../components/ShareModal/ShareModal';

export function useTableShare(tables: CustomizeTimeBoxInfo[]) {
  const { isOpen, openModal, closeModal, ModalWrapper } = useModal();
  const baseUrl =
    import.meta.env.MODE !== 'production'
      ? undefined
      : import.meta.env.VITE_API_BASE_URL;
  const shareUrl = createEncodedURL(baseUrl, tables);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const TableShareModal = () =>
    isOpen ? (
      <ModalWrapper>
        <ShareModal shareUrl={shareUrl} onClick={() => handleCopy()} />
      </ModalWrapper>
    ) : null;

  return {
    isShareOpen: isOpen,
    openShareModal: openModal,
    closeShareModal: closeModal,
    TableShareModal,
  };
}
