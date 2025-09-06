import { createBrowserRouter } from 'react-router-dom';
import TableListPage from '../page/TableListPage/TableListPage';
import TableOverviewPage from '../page/TableOverviewPage/TableOverviewPage';
import TableCompositionPage from '../page/TableComposition/TableCompositionPage';
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper';
import ProtectedRoute from './ProtectedRoute';
import OAuth from '../page/OAuthPage/OAuth';
import ReactGA from 'react-ga4';
import NotFoundPage from '../components/ErrorBoundary/NotFoundPage';
import BackActionHandler from '../components/BackActionHandler';
import TimerPage from '../page/TimerPage/TimerPage';
import LandingPage from '../page/LandingPage/LandingPage';
import TableSharingPage from '../page/TableSharingPage/TableSharingPage';
import DebateEndPage from '../page/DebateEndPage/DebateEndPage';

const routesConfig = [
  {
    path: '/home',
    element: <LandingPage />,
    requiresAuth: false,
  },
  {
    path: '/',
    element: <TableListPage />,
    requiresAuth: true,
  },
  {
    path: '/composition',
    element: <TableCompositionPage />,
    requiresAuth: false,
  },
  {
    path: '/overview/:type/:id',
    element: <TableOverviewPage />,
    requiresAuth: false,
  },
  {
    path: '/table/customize/:id',
    element: <TimerPage />,
    requiresAuth: false,
  },
  {
    path: '/table/customize/:id/end',
    element: <DebateEndPage />,
    requiresAuth: true,
  },
  {
    path: '/oauth',
    element: <OAuth />,
    requiresAuth: false,
  },
  {
    path: '/share',
    element: <TableSharingPage />,
    requiresAuth: false,
  },
  {
    path: '*',
    element: <NotFoundPage />,
    requiresAuth: false,
  },
];

const router = createBrowserRouter([
  {
    element: (
      <>
        <ErrorBoundaryWrapper />
        <BackActionHandler />
      </>
    ),
    children: routesConfig.map((route) => ({
      ...route,
      element: route.requiresAuth ? (
        <ProtectedRoute>{route.element}</ProtectedRoute>
      ) : (
        route.element
      ),
    })),
  },
]);

// 라우트 변경 시 Google Analytics 이벤트 전송
router.subscribe(({ location }) => {
  ReactGA.send({ hitType: 'pageview', page: location.pathname });
});

export default router;
