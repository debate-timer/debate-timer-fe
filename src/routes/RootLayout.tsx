import { ScrollRestoration } from 'react-router-dom';
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper';
import BackActionHandler from '../components/BackActionHandler';

export default function RootLayout() {
  return (
    <>
      <ErrorBoundaryWrapper />
      <BackActionHandler />
      <ScrollRestoration />
    </>
  );
}
