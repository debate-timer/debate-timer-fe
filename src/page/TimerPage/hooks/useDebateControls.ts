import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthRevision } from '../../../util/accessToken';
import { appendRecordingJoin } from '../../../util/recordingJoinLink';
import useTranscriptRecorder, {
  TranscriptRecorderMode,
} from './useTranscriptRecorder';
import { UseDebateTranscriberParams } from './useDebateTranscriber';
import useLiveShareSession from './useLiveShareSession';
import useDebateMenuIssues from './useDebateMenuIssues';

export type DebateFeatureStatus = 'inactive' | 'active' | 'error';
// share-qr: 공유 링크의 QR 코드와 링크 복사를 보여주는 창
export type DebateOverlay =
  | 'closed'
  | 'menu'
  | 'share-consent'
  | 'share-qr'
  | 'transcript-consent'
  | 'mic-check';

interface UseDebateControlsOptions extends UseDebateTranscriberParams {
  stopTimers: () => void;
  canShare: boolean;
  canTranscribe: boolean;
  // 다기기 녹음 피쳐 플래그가 있으면 true
  canUseMultiDevice?: boolean;
  isInputBlocked?: boolean;
  onSyncRequest?: () => void;
}

/**
 * 페이지 수명에 두며 메뉴 개폐와 기능 실행의 수명을 분리하는 조립 훅임.
 *
 * `useDebateControls`는 테이블·현재 차례·진영·실행 여부·인식 언어 후보, 공유/속기 허용 여부와 `stopTimers`·`onSyncRequest`를 받음. `DebateMenu`·`DebateFeatureIndicators`는 반환한 표시 상태·콜백만 소비함. 훅을 오버레이 밖의 페이지 수명에 배치하며 테이블 변경 시 페이지 조립 경계를 새로 마운트함. 메뉴 개폐는 기능을 재생성하지 않음.
 *
 * 페이지는 `answerTime`·`isAnswerTimeEnabled`·`isInputBlocked`를 `TimerView`와 본문 입력 경계에 연결하고 `useTimerHotkey.isEnabled`에도 같은 입력 가능 여부를 전달함. `interrupt`는 입력 차단·타이머 정지·기록 폐기를 한 번 수행하며 `useDebateLogout.interrupt`에 전달함.
 *
 */
export default function useDebateControls(options: UseDebateControlsOptions) {
  const {
    canShare,
    canTranscribe,
    onSyncRequest,
    isInputBlocked = false,
  } = options;
  // 상태 동기화 응답 뒤에 다기기 녹음 참가 정보도 다시 보내, 녹음을 켠 뒤 들어오거나 재연결한 청중도 참여할 수 있게 한다.
  const recordingSyncRef = useRef<() => void>(() => {});
  const share = useLiveShareSession(options.tableId, {
    onSyncRequest: () => {
      onSyncRequest?.();
      recordingSyncRef.current();
    },
  });
  const transcript = useTranscriptRecorder({
    ...options,
    isMultiDeviceAllowed: options.canUseMultiDevice ?? false,
    getSegmentVersion: share.getLastTransitionVersion,
  });
  const menuIssues = useDebateMenuIssues({ share, transcript, canShare });
  const [overlay, setOverlay] = useState<DebateOverlay>('closed');
  const [answerTime, setAnswerTime] = useState(30);
  const [isAnswerTimeEnabled, setIsAnswerTimeEnabled] = useState(true);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<TranscriptRecorderMode>(
    transcript.sttMode,
  );
  const [acknowledgedFailures, setAcknowledgedFailures] = useState(0);
  const retryFailuresRef = useRef<number | null>(null);
  const interruptedRef = useRef(false);
  const pendingRef = useRef(false);
  // 사용자가 공유를 시작했으면 연결된 순간 QR 창을 띄운다. 자동 재연결로 다시 공유될 때는 띄우지 않는다.
  const shouldShowShareQrRef = useRef(false);
  const operationRef = useRef(0);
  const identityRef = useRef(getAuthRevision());
  const { discard } = transcript;
  const { stopSharing } = share;
  const actionsRef = useRef({
    discard,
    stopSharing,
    stopTimers: options.stopTimers,
  });
  useEffect(() => {
    actionsRef.current = {
      discard,
      stopSharing,
      stopTimers: options.stopTimers,
    };
  }, [discard, stopSharing, options.stopTimers]);

  const interrupt = useCallback(() => {
    if (interruptedRef.current) {
      return;
    }
    operationRef.current += 1;
    interruptedRef.current = true;
    setIsInterrupted(true);
    setIsAnswerTimeEnabled(false);
    setOverlay('closed');
    actionsRef.current.stopTimers();
    actionsRef.current.discard();
  }, []);

  useEffect(() => {
    const handleIdentity = () => {
      if (identityRef.current !== getAuthRevision()) {
        identityRef.current = getAuthRevision();
        interrupt();
        actionsRef.current.stopSharing();
      }
    };
    window.addEventListener('auth-changed', handleIdentity);
    window.addEventListener('storage', handleIdentity);
    return () => {
      window.removeEventListener('auth-changed', handleIdentity);
      window.removeEventListener('storage', handleIdentity);
    };
  }, [interrupt]);

  useEffect(() => {
    if (
      transcript.isEnabled &&
      !transcript.isPending &&
      !transcript.error &&
      retryFailuresRef.current !== null
    ) {
      setAcknowledgedFailures(retryFailuresRef.current);
      retryFailuresRef.current = null;
    }
  }, [transcript.error, transcript.isEnabled, transcript.isPending]);

  const requestShare = (next: boolean) => {
    if (interruptedRef.current || share.isLoading) {
      return;
    }
    if (!next) {
      shouldShowShareQrRef.current = false;
      share.stopSharing();
      return;
    }
    if (canShare) {
      setOverlay('share-consent');
    }
  };
  const requestTranscript = (next: boolean) => {
    if (interruptedRef.current || pendingRef.current) {
      return;
    }
    if (!next) {
      setAcknowledgedFailures(transcript.failedCount);
      // 다기기 녹음을 끄면 세션이 끝나므로, 공유 화면의 청중이 녹음을 멈추도록 알린다.
      const closedRecording = transcript.disable();
      if (closedRecording && share.isSharing) {
        share.issueEvent('RECORDING_CLOSED', null, closedRecording);
      }
      return;
    }
    if (
      canTranscribe &&
      Object.values(transcript.supportedModes).some(Boolean)
    ) {
      setOverlay('transcript-consent');
    }
  };
  const confirm = async () => {
    if (interruptedRef.current || pendingRef.current) {
      return;
    }
    if (overlay === 'share-consent' && canShare) {
      if (share.isError) {
        share.restartLiveShare();
      } else {
        share.startSharing();
      }
      shouldShowShareQrRef.current = true;
      setOverlay('menu');
    } else if (overlay === 'transcript-consent' && canTranscribe) {
      setOverlay('mic-check');
    } else if (overlay === 'mic-check' && canTranscribe) {
      const operation = ++operationRef.current;
      pendingRef.current = true;
      retryFailuresRef.current = transcript.failedCount;
      try {
        await transcript.enable(selectedMode);
      } finally {
        if (operation === operationRef.current) {
          pendingRef.current = false;
        }
      }
      if (!interruptedRef.current && operation === operationRef.current) {
        setOverlay('menu');
      }
    }
  };
  const changeMode = (mode: TranscriptRecorderMode) => {
    if (!transcript.isModeLocked && transcript.supportedModes[mode]) {
      setSelectedMode(mode);
    }
  };
  const getStatus = (active: boolean, error: boolean): DebateFeatureStatus =>
    error ? 'error' : active ? 'active' : 'inactive';

  const { isSharing: isShareConnected, isError: isShareError } = share;
  useEffect(() => {
    if (overlay === 'share-qr' && !isShareConnected) {
      setOverlay('menu');
      return;
    }
    if (!shouldShowShareQrRef.current) {
      return;
    }
    if (isShareError) {
      shouldShowShareQrRef.current = false;
      return;
    }
    if (isShareConnected && !interruptedRef.current) {
      shouldShowShareQrRef.current = false;
      setOverlay('share-qr');
    }
  }, [isShareConnected, isShareError, overlay]);

  // 이미 공유 화면을 보고 있는 청중도 다기기 녹음에 참여할 수 있도록 참가 정보를 공유 채널로 보낸다.
  const recordingSession = transcript.multiDeviceSession;
  const { issueEvent, isSharing } = share;
  useEffect(() => {
    recordingSyncRef.current = () => {
      if (recordingSession) {
        issueEvent('RECORDING_OPENED', null, recordingSession);
      }
    };
  }, [issueEvent, recordingSession]);
  const recordingSessionKey = recordingSession?.sessionKey;
  const recordingJoinCode = recordingSession?.joinCode;
  useEffect(() => {
    if (isSharing && recordingSessionKey && recordingJoinCode) {
      issueEvent('RECORDING_OPENED', null, {
        sessionKey: recordingSessionKey,
        joinCode: recordingJoinCode,
      });
    }
  }, [isSharing, issueEvent, recordingJoinCode, recordingSessionKey]);

  // 다기기 녹음 중이면 청중이 녹음에 참여할 수 있도록 공유 링크에 녹음 세션·참가 코드를 붙인다.
  const shareUrl = transcript.multiDeviceSession
    ? appendRecordingJoin(share.shareUrl, transcript.multiDeviceSession)
    : share.shareUrl;

  return {
    isMainTimerRunning: options.isRunning,
    canShare,
    canTranscribe,
    share,
    shareUrl,
    transcript,
    menuIssues,
    overlay,
    answerTime,
    isAnswerTimeEnabled,
    selectedMode: transcript.isModeLocked ? transcript.sttMode : selectedMode,
    isInterrupted,
    isInputBlocked: isInterrupted || isInputBlocked || overlay !== 'closed',
    statuses: {
      share: getStatus(share.isSharing, share.isError),
      transcript: getStatus(
        transcript.isEnabled,
        Boolean(transcript.error) ||
          (transcript.isEnabled &&
            transcript.failedCount > acknowledgedFailures),
      ),
      answer: getStatus(isAnswerTimeEnabled, false),
    },
    openMenu: () => {
      if (!interruptedRef.current) {
        setOverlay('menu');
      }
    },
    closeOverlay: () => setOverlay('closed'),
    openShareQr: () => {
      if (!interruptedRef.current && share.isSharing) {
        setOverlay('share-qr');
      }
    },
    cancelConfirmation: () => {
      operationRef.current += 1;
      if (pendingRef.current) {
        transcript.disable();
        pendingRef.current = false;
      }
      setOverlay('menu');
    },
    requestShare,
    requestTranscript,
    confirm,
    changeMode,
    interrupt,
    changeAnswerTime: (value: number) => {
      if (!interruptedRef.current && [15, 30, 45, 60].includes(value)) {
        setAnswerTime(value);
      }
    },
    changeAnswerEnabled: (value: boolean) => {
      if (!interruptedRef.current) {
        setIsAnswerTimeEnabled(value);
      }
    },
  };
}

export type DebateControls = ReturnType<typeof useDebateControls>;
