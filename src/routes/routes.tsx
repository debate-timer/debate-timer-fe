import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../page/LoginPage/LoginPage';
import TableListPage from '../page/TableListPage/TableListPage';
import TableOverview from '../page/TableOverviewPage/TableOverview';
import TableComposition from '../page/TableComposition/TableComposition';
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper';
import ProtectedRoute from './ProtectedRoute';
import OAuth from '../page/LoginPage/OAuth';
import ReactGA from 'react-ga4';
import NotFoundPage from '../components/ErrorBoundary/NotFoundPage';
import BackActionHandler from '../components/BackActionHandler';
import TimerPage from '../page/TimerPage/TimerPage';
import LandingPage from '../page/LandingPage/LandingPage';
const routesConfig = [
  {
    path: '/login',
    element: <LoginPage />,
    requiresAuth: false,
  },
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
    element: <TableComposition />,
    requiresAuth: true,
  },
  {
    path: '/overview/:type/:id',
    element: <TableOverview />,
    requiresAuth: true,
  },
  {
    path: '/table/customize/:id',
    element: <TimerPage />,
    requiresAuth: true,
  },
  {
    path: '/oauth',
    element: <OAuth />,
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
