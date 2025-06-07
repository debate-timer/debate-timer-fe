import { Navigate, useLocation } from 'react-router-dom';

import { PropsWithChildren } from 'react';
import { getAccessToken } from '../util/accessToken';

export default function ProtectedRoute(props: PropsWithChildren) {
  const { children } = props;

  const isAuthenticated = getAccessToken() || false;
  const location = useLocation();

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to={'/home'} state={{ from: location }} replace />
  );
}
