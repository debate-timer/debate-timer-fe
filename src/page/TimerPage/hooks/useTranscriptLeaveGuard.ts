import { useCallback } from 'react';
import { BlockerFunction, useBlocker } from 'react-router-dom';
import { buildLangPath, DEFAULT_LANG } from '../../../util/languageRouting';

interface UseTranscriptLeaveGuardParams {
  tableId: number;
  isRecording: boolean;
}

// 언어 접두어와 관계없이 이 테이블의 토론 종료 화면인지 판정한다.
export function isDebateEndPath(pathname: string, tableId: number) {
  return (
    buildLangPath(pathname, DEFAULT_LANG) === `/table/customize/${tableId}/end`
  );
}

// 언어 접두어와 관계없이 이 테이블의 타이머 화면인지 판정한다.
export function isTimerPath(pathname: string, tableId: number) {
  return (
    buildLangPath(pathname, DEFAULT_LANG) === `/table/customize/${tableId}`
  );
}

/**
 * 토론 기록 중 타이머 화면을 벗어나면 속기록이 유실되므로 이탈을 막고 확인을 받는다.
 * 앱 안의 화면 이동은 안내창으로 막으며 문서 이탈 경고는 TimerPage의 공용 훅이 소유한다.
 * 기록을 서버로 보내는 토론 종료 화면으로의 이동은 막지 않는다.
 */
export default function useTranscriptLeaveGuard(
  params: UseTranscriptLeaveGuardParams,
) {
  const { tableId, isRecording } = params;

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      isRecording &&
      buildLangPath(currentLocation.pathname, DEFAULT_LANG) !==
        buildLangPath(nextLocation.pathname, DEFAULT_LANG) &&
      !isDebateEndPath(nextLocation.pathname, tableId),
    [isRecording, tableId],
  );
  const blocker = useBlocker(shouldBlock);

  const confirmLeave = useCallback(() => {
    blocker.proceed?.();
  }, [blocker]);

  const cancelLeave = useCallback(() => {
    blocker.reset?.();
  }, [blocker]);

  return {
    isLeaveModalOpen: blocker.state === 'blocked',
    confirmLeave,
    cancelLeave,
  };
}
