import { useState } from 'react';
import type useLiveShareSession from './useLiveShareSession';
import type useTranscriptRecorder from './useTranscriptRecorder';

interface DebateMenuIssuesOptions {
  share: Pick<
    ReturnType<typeof useLiveShareSession>,
    'isError' | 'isLoading' | 'isSharing'
  >;
  transcript: Pick<
    ReturnType<typeof useTranscriptRecorder>,
    'sttMode' | 'multiDeviceSession' | 'isEnabled' | 'error' | 'failedCount'
  >;
  canShare: boolean;
}

/** 메뉴 밖에서도 오류를 집계하고, 일회성 안내의 확인은 현재 토론에서만 기억함. */
export default function useDebateMenuIssues(options: DebateMenuIssuesOptions) {
  const { share, transcript, canShare } = options;
  const { sttMode, failedCount } = transcript;
  const sessionKey = transcript.multiDeviceSession?.sessionKey;
  const [failures, setFailures] = useState({
    sttMode,
    sessionKey,
    failedCount,
    seenCount: 0,
  });
  const [seenSessionKey, setSeenSessionKey] = useState<string>();
  const hasNewFailureSource =
    failures.sttMode !== sttMode ||
    failures.sessionKey !== sessionKey ||
    failedCount < failures.failedCount;
  const seenCount = hasNewFailureSource ? 0 : failures.seenCount;
  if (hasNewFailureSource || failures.failedCount !== failedCount) {
    setFailures({ sttMode, sessionKey, failedCount, seenCount });
  }
  if (seenSessionKey !== undefined && seenSessionKey !== sessionKey) {
    setSeenSessionKey(undefined);
  }
  const hasShareAdvice = Boolean(
    canShare &&
    sessionKey &&
    transcript.isEnabled &&
    !share.isSharing &&
    !share.isLoading &&
    !share.isError,
  );
  return {
    hasShareError: share.isError,
    hasTranscriptError: Boolean(transcript.error),
    hasUnseenFailures: failedCount > seenCount,
    hasShareAdvice,
    hasUnseenShareAdvice: hasShareAdvice && seenSessionKey !== sessionKey,
    acknowledgeFailures: () =>
      setFailures({ sttMode, sessionKey, failedCount, seenCount: failedCount }),
    acknowledgeShareAdvice: () => setSeenSessionKey(sessionKey),
  };
}
