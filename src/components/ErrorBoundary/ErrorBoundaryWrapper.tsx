import { Outlet } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import GoogleAnalytics from '../../util/GoogleAnalytics';

export default function ErrorBoundaryWrapper() {
  return (
    <ErrorBoundary>
      <GoogleAnalytics />
      <Outlet />
    </ErrorBoundary>
  );
}
