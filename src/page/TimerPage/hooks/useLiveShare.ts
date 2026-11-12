import { useCallback, useEffect, useRef, useState } from 'react';
import useLiveShareSession from './useLiveShareSession';
export type { LiveShareErrorType } from './useLiveShareSession';
export { CHAIRMAN_TOKEN_REFRESH_BEFORE_MS } from './useLiveShareSession';

/** MP-04의 호출부 전환까지 기존 모달 진입 API를 유지하는 어댑터임. */
export function useLiveShare(
  tableId: number,
  options: { onSyncRequest?: () => void } = {},
) {
  const session = useLiveShareSession(tableId, { ...options, isLegacy: true });
  const { startSharing, isReplaced } = session;
  const [isLiveShareModalOpen, setIsLiveShareModalOpen] = useState(false);
  const liveShareModalRef = useRef<HTMLDivElement>(null);
  const toggleLiveShareModal = useCallback(() => {
    setIsLiveShareModalOpen((previous) => !previous);
  }, []);
  useEffect(() => {
    if (isLiveShareModalOpen) {
      startSharing();
    }
  }, [isLiveShareModalOpen, startSharing]);
  useEffect(() => {
    if (isReplaced) {
      setIsLiveShareModalOpen(true);
    }
  }, [isReplaced]);
  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        isLiveShareModalOpen &&
        liveShareModalRef.current &&
        !liveShareModalRef.current.contains(event.target as Node)
      ) {
        setIsLiveShareModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isLiveShareModalOpen]);
  return {
    ...session,
    isLiveShareModalOpen,
    toggleLiveShareModal,
    liveShareModalRef,
  };
}
