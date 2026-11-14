import { ScrollRestoration } from 'react-router-dom';
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper';

export default function RootLayout() {
  return (
    <>
      <ErrorBoundaryWrapper />
      <ScrollRestoration />
    </>
  );
}
