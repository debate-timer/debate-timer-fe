import { Navigate, useLocation } from 'react-router-dom';

import { PropsWithChildren } from 'react';
import { getMemberIdToken } from '../util/memberIdToken';

export default function ProtectedRoute(props: PropsWithChildren) {
  const { children } = props;

  const isAuthenticated = getMemberIdToken() || true;
  const location = useLocation();

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to={'/login'} state={{ from: location }} replace />
  );
}
