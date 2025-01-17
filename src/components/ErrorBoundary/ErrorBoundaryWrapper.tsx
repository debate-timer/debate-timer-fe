import { Outlet } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

export default function ErrorBoundaryWrapper() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
