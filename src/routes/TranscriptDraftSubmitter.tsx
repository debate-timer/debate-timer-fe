import useTranscriptDraftSubmitter from '../hooks/useTranscriptDraftSubmitter';

/** 토론을 끝낸 기록은 어느 화면으로 이동해도 제출되도록 라우터 최상위에서 보낸다. */
export default function TranscriptDraftSubmitter() {
  useTranscriptDraftSubmitter();
  return null;
}
