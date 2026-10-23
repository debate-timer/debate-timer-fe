import { useCallback, useEffect, useState } from 'react';
import { SttMode } from '../../../types/transcript';
import useDebateTranscriber, {
  UseDebateTranscriberParams,
} from './useDebateTranscriber';
import useSonioxTranscriber from './useSonioxTranscriber';

/**
 * 토론 기록의 STT 모드(크롬 실시간 인식·Soniox 구간 배치 전사)를 고르고, 고른 모드의 기록 상태를 하나로 보여준다.
 * 두 방식의 초안이 섞이지 않도록 한 번 기록을 시작하면 이 화면에서는 모드를 바꾸지 않는다.
 */
export default function useTranscriptRecorder(
  params: UseDebateTranscriberParams,
) {
  const rpc = useDebateTranscriber(params);
  const soniox = useSonioxTranscriber(params);
  const supportedModes: Record<SttMode, boolean> = {
    RPC: rpc.isSupported,
    SONIOX: soniox.isSupported,
  };

  const [sttMode, setSttMode] = useState<SttMode>(() =>
    rpc.isSupported || !soniox.isSupported ? 'RPC' : 'SONIOX',
  );
  const [isModeLocked, setIsModeLocked] = useState(false);
  const isActiveEnabled =
    sttMode === 'SONIOX' ? soniox.isEnabled : rpc.isEnabled;

  useEffect(() => {
    if (isActiveEnabled) {
      setIsModeLocked(true);
    }
  }, [isActiveEnabled]);

  const { enable: enableRpc, disable: disableRpc } = rpc;
  const { enable: enableSoniox, disable: disableSoniox } = soniox;

  const enable = useCallback(
    async (mode: SttMode) => {
      const nextMode = isModeLocked ? sttMode : mode;
      setSttMode(nextMode);
      if (nextMode === 'SONIOX') {
        await enableSoniox();
        return;
      }
      enableRpc();
    },
    [enableRpc, enableSoniox, isModeLocked, sttMode],
  );

  const disable = useCallback(() => {
    if (sttMode === 'SONIOX') {
      disableSoniox();
      return;
    }
    disableRpc();
  }, [disableRpc, disableSoniox, sttMode]);

  const active =
    sttMode === 'SONIOX'
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
    sttMode,
    isModeLocked,
    supportedModes,
    enable,
    disable,
  };
}
