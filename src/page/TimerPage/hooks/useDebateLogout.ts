import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthRevision } from '../../../util/accessToken';
import useLogout from '../../../hooks/mutations/useLogout';

interface UseDebateLogoutOptions {
  stopTimers: () => void;
  discardTranscript: () => void;
  stopSharing: () => unknown;
  exitFullscreen: () => Promise<void>;
  issueSettings: () => void;
  onSuccess: () => void;
}

/**
 * 확인 이후의 로컬 폐기와 로그아웃을 직렬화하며 실패해도 진행을 자동 재개하지 않음.
 *
 * `useDebateLogout`은 `SettingsModal.onLogout`에 전달할 `requestLogout(): Promise<void>`와 확인 UI 상태를 제공함. 호출자는 타이머 정지·속기 폐기·공유 중단·전체 화면 해제·설정 발행·성공 이동을 연결함. 취소는 Promise를 완료하고 로그아웃 실패는 거절함. 로컬 정리는 한 번만 실행하고 실패 뒤 재시도는 로그아웃을 다시 수행함.
 *
 */
export default function useDebateLogout(options: UseDebateLogoutOptions) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const busyRef = useRef(false);
  const interruptedRef = useRef(false);
  const requestRef = useRef<{
    promise: Promise<void>;
    resolve: () => void;
    reject: (error: unknown) => void;
  } | null>(null);
  const sessionRevisionRef = useRef(getAuthRevision());
  const logout = useLogout(options.onSuccess, {
    expectedAuthRevision: sessionRevisionRef.current,
  });

  const requestLogout = useCallback(() => {
    if (requestRef.current) {
      return requestRef.current.promise;
    }
    let resolve!: () => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<void>((done, fail) => {
      resolve = done;
      reject = fail;
    });
    requestRef.current = { promise, resolve, reject };
    setIsConfirmOpen(true);
    return promise;
  }, []);

  const cancelLogout = useCallback(() => {
    if (busyRef.current) {
      return;
    }
    setIsConfirmOpen(false);
    requestRef.current?.resolve();
    requestRef.current = null;
  }, []);

  const confirmLogout = useCallback(async () => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setIsPending(true);
    setHasError(false);
    try {
      if (sessionRevisionRef.current !== getAuthRevision()) {
        throw new Error('ACCOUNT_CHANGED');
      }
      if (!interruptedRef.current) {
        interruptedRef.current = true;
        setIsInterrupted(true);
        options.stopTimers();
        options.discardTranscript();
        try {
          options.stopSharing();
        } catch {
          /* 공유 발행 실패가 로그아웃을 차단하지 않음. */
        }
        await options.exitFullscreen();
      }
      if (sessionRevisionRef.current !== getAuthRevision()) {
        throw new Error('ACCOUNT_CHANGED');
      }
      options.issueSettings();
      await logout.mutateAsync();
      setIsConfirmOpen(false);
      requestRef.current?.resolve();
      requestRef.current = null;
    } catch (error) {
      setHasError(true);
      requestRef.current?.reject(error);
      requestRef.current = null;
    } finally {
      busyRef.current = false;
      setIsPending(false);
    }
  }, [logout, options]);

  useEffect(
    () => () => {
      requestRef.current?.resolve();
    },
    [],
  );
  return {
    requestLogout,
    confirmLogout,
    cancelLogout,
    isConfirmOpen,
    isInterrupted,
    isPending,
    hasError,
  };
}
