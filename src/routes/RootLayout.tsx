import { ScrollRestoration } from 'react-router-dom';
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper';
import useTranscriptDraftSubmitter from '../hooks/useTranscriptDraftSubmitter';

export default function RootLayout() {
  // 토론을 끝낸 기록은 어느 화면으로 이동해도 제출되도록 앱 수명에서 보낸다.
  useTranscriptDraftSubmitter();

  return (
    <>
      <ErrorBoundaryWrapper />
      <ScrollRestoration />
    </>
  );
}
