import { Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

export default function ErrorBoundaryWrapper() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={`${location.pathname}${location.search}`}>
      <Outlet />
    </ErrorBoundary>
  );
}
