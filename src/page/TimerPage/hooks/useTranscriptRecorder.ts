import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthRevision } from '../../../util/accessToken';
import { SttMode } from '../../../types/transcript';
import useDebateTranscriber, {
  UseDebateTranscriberParams,
} from './useDebateTranscriber';
import useSonioxTranscriber from './useSonioxTranscriber';
import useMultiDeviceTranscriber from './useMultiDeviceTranscriber';
import { RecordingJoin } from '../../../util/recordingJoinLink';

// 'MULTI_DEVICE'는 다기기 녹음 V2. 서버가 속기록을 만들므로 속기록의 STT 모드(SttMode)와 구분한다.
export type TranscriptRecorderMode = SttMode | 'MULTI_DEVICE';

export interface UseTranscriptRecorderParams extends UseDebateTranscriberParams {
  // 다기기 녹음 피쳐 플래그가 있으면 true
  isMultiDeviceAllowed?: boolean;
  // 청중에게 보낸 마지막 타이머 전환 이벤트의 version. 다기기 녹음의 턴 키로 쓴다.
  getSegmentVersion?: () => number | null;
}

const noSegmentVersion = () => null;

/**
 * 토론 기록의 STT 모드(크롬 실시간 인식·Soniox 구간 배치 전사·다기기 녹음)를 고르고, 고른 모드의 기록 상태를 하나로 보여준다.
 * 방식별 기록이 섞이지 않도록 기록하는 동안에는 모드를 바꾸지 않는다.
 * 끄면 모드를 다시 고를 수 있고, 다른 모드로 켜면 이전 모드의 기록은 버린다.
 */
export default function useTranscriptRecorder(
  params: UseTranscriptRecorderParams,
) {
  const {
    isMultiDeviceAllowed = false,
    getSegmentVersion = noSegmentVersion,
    ...transcriberParams
  } = params;
  const recognitionLangRef = useRef<string | null>(null);
  const stableParams = {
    ...transcriberParams,
    lang: recognitionLangRef.current ?? params.lang,
  };
  const rpc = useDebateTranscriber(stableParams);
  const soniox = useSonioxTranscriber(stableParams);
  const multiDevice = useMultiDeviceTranscriber({
    ...stableParams,
    getSegmentVersion,
  });
  const supportedModes: Record<TranscriptRecorderMode, boolean> = {
    RPC: rpc.isSupported,
    SONIOX: soniox.isSupported,
    MULTI_DEVICE: isMultiDeviceAllowed && multiDevice.isSupported,
  };

  const [sttMode, setSttMode] = useState<TranscriptRecorderMode>(() =>
    rpc.isSupported || !soniox.isSupported ? 'RPC' : 'SONIOX',
  );
  const [isModeLocked, setIsModeLocked] = useState(false);
  const isActiveEnabled =
    sttMode === 'SONIOX'
      ? soniox.isEnabled
      : sttMode === 'MULTI_DEVICE'
        ? multiDevice.isEnabled
        : rpc.isEnabled;

  useEffect(() => {
    if (isActiveEnabled) {
      setIsModeLocked(true);
    }
  }, [isActiveEnabled]);

  const { enable: enableRpc, disable: disableRpc, discard: discardRpc } = rpc;
  const {
    enable: enableSoniox,
    disable: disableSoniox,
    discard: discardSoniox,
  } = soniox;
  const {
    enable: enableMultiDevice,
    disable: disableMultiDevice,
    discard: discardMultiDevice,
  } = multiDevice;
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);

  const enable = useCallback(
    async (mode: TranscriptRecorderMode) => {
      if (isPendingRef.current) {
        return;
      }
      recognitionLangRef.current ??= params.lang;
      const nextMode = isModeLocked ? sttMode : mode;
      // 다른 모드로 다시 켜면 이전 모드의 기록이 종료 화면에서 섞이지 않게 버린다.
      if (nextMode !== sttMode) {
        if (sttMode === 'RPC') {
          discardRpc();
        } else if (sttMode === 'SONIOX') {
          discardSoniox();
        }
      }
      setSttMode(nextMode);
      if (nextMode === 'RPC') {
        // 이 탭에 남은 다기기 녹음 세션이 종료 화면에서 이번 기록 대신 쓰이지 않게 지운다.
        discardMultiDevice();
        enableRpc(recognitionLangRef.current);
        return;
      }
      if (nextMode === 'SONIOX') {
        discardMultiDevice();
      }
      isPendingRef.current = true;
      setIsPending(true);
      try {
        await (nextMode === 'SONIOX'
          ? enableSoniox(recognitionLangRef.current)
          : enableMultiDevice(recognitionLangRef.current));
      } finally {
        isPendingRef.current = false;
        setIsPending(false);
      }
    },
    [
      discardMultiDevice,
      discardRpc,
      discardSoniox,
      enableMultiDevice,
      enableRpc,
      enableSoniox,
      isModeLocked,
      sttMode,
      params.lang,
    ],
  );

  // 끄면 모드 잠금을 푼다. 다기기 녹음은 끄면 세션을 끝내므로, 청중에게 알릴 끝낸 세션의 참가 정보를 돌려준다.
  const disable = useCallback((): RecordingJoin | null => {
    setIsModeLocked(false);
    if (sttMode === 'SONIOX') {
      disableSoniox();
      return null;
    }
    if (sttMode === 'MULTI_DEVICE') {
      return disableMultiDevice();
    }
    disableRpc();
    return null;
  }, [disableMultiDevice, disableRpc, disableSoniox, sttMode]);

  const discard = useCallback(() => {
    discardRpc();
    discardSoniox();
    discardMultiDevice();
    isPendingRef.current = false;
    setIsPending(false);
  }, [discardMultiDevice, discardRpc, discardSoniox]);

  const identityRef = useRef({
    tableId: params.tableId,
    revision: getAuthRevision(),
  });
  useEffect(() => {
    if (identityRef.current.tableId !== params.tableId) {
      discard();
      recognitionLangRef.current = null;
      setIsModeLocked(false);
      identityRef.current = {
        tableId: params.tableId,
        revision: getAuthRevision(),
      };
    }
    const handleIdentity = () => {
      if (identityRef.current.revision !== getAuthRevision()) {
        discard();
      }
    };
    window.addEventListener('auth-changed', handleIdentity);
    window.addEventListener('storage', handleIdentity);
    return () => {
      window.removeEventListener('auth-changed', handleIdentity);
      window.removeEventListener('storage', handleIdentity);
    };
  }, [discard, params.tableId]);

  const active =
    sttMode === 'MULTI_DEVICE'
      ? {
          isEnabled: multiDevice.isEnabled,
          isListening: multiDevice.isListening,
          // 다기기 녹음은 서버가 전사하므로 이 기기에서 센 문장이 없다.
          utteranceCount: 0,
          pendingCount: multiDevice.pendingCount,
          failedCount: multiDevice.failedCount,
          error: multiDevice.error,
        }
      : sttMode === 'SONIOX'
        ? {
            isEnabled: soniox.isEnabled,
            isListening: soniox.isListening,
            utteranceCount: soniox.utteranceCount,
            pendingCount: soniox.pendingCount,
            failedCount: soniox.failedCount,
            error: soniox.error,
          }
        : {
            isEnabled: rpc.isEnabled,
            isListening: rpc.isListening,
            utteranceCount: rpc.utteranceCount,
            pendingCount: 0,
            failedCount: 0,
            error: rpc.error,
          };

  return {
    ...active,
    isPending,
    discard,
    sttMode,
    isModeLocked,
    supportedModes,
    // 켜져 있는 다기기 녹음 세션. 청중 공유 링크에 참가 코드를 붙이고 청중에게 참가 정보를 보낼 때 쓴다.
    multiDeviceSession: multiDevice.session,
    enable,
    disable,
  };
}
