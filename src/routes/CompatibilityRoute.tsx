import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCompatibilityDestination } from '../util/headerNavigation';

/** 인증 판정보다 먼저 이전 링크를 정규화해 최종 목적지를 보존함. */
export default function CompatibilityRoute(props: PropsWithChildren) {
  const location = useLocation();
  const destination = getCompatibilityDestination(
    `${location.pathname}${location.search}${location.hash}`,
  );
  return destination ? (
    <Navigate to={destination} replace state={location.state} />
  ) : (
    props.children
  );
}
