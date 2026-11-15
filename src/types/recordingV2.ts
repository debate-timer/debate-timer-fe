// 다기기 녹음 V2의 세션·턴 상태와 녹음 품질 지표. 서버 recording-v2 API 계약과 같은 값을 쓴다.

export type RecordingSessionStatusV2 =
  'RECORDING' | 'FINISHING' | 'COMPLETED' | 'FAILED';

export type RecordingTurnStatusV2 = 'PROCESSING' | 'DONE' | 'FAILED';

// 기기가 녹음하는 동안 Web Audio로 잰 품질. 서버는 다섯 값이 모두 있고 범위가 맞을 때만 점수에 쓴다.
export interface RecordingQualityMetricsV2 {
  // 평균 음량(dBFS, 0 이하)
  rmsDb: number;
  // 최대 순간 음량(dBFS, 0 이하, rmsDb 이상)
  peakDb: number;
  // 최대 진폭에 닿은 샘플 비율(0~1)
  clippingRatio: number;
  // 무음으로 본 구간 비율(0~1)
  silenceRatio: number;
  // 말소리와 배경 소음의 차이(dB)
  snrDb: number;
}
