import { createBrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import TableListPage from '../page/TableListPage/TableListPage';
import TableOverviewPage from '../page/TableOverviewPage/TableOverviewPage';
import TableCompositionPage from '../page/TableComposition/TableCompositionPage';
import ErrorBoundaryWrapper from '../components/ErrorBoundary/ErrorBoundaryWrapper';
import ProtectedRoute from './ProtectedRoute';
import OAuth from '../page/OAuthPage/OAuth';
import NotFoundPage from '../components/ErrorBoundary/NotFoundPage';
import BackActionHandler from '../components/BackActionHandler';
import TimerPage from '../page/TimerPage/TimerPage';
import FeedbackTimerPage from '../page/TimerPage/FeedbackTimerPage';
import HomePage from '../page/HomePage/HomePage';
import TableSharingPage from '../page/TableSharingPage/TableSharingPage';
import DebateEndPage from '../page/DebateEndPage/DebateEndPage';
import DebateVotePage from '../page/DebateVotePage/DebateVotePage';
import VoteParticipationPage from '../page/VoteParticipationPage/VoteParticipationPage';
import VoteCompletePage from '../page/VoteCompletePage/VoteCompletePage';
import DebateVoteResultPage from '../page/DebateVoteResultPage/DebateVoteResultPage';
import LanguageWrapper from './LanguageWrapper';
import AudienceSharePage from '../page/AudienceSharePage/AudienceSharePage';
import MaintenanceRoute from './MaintenanceRoute';
import { MaintenanceAccess } from './maintenanceAccess';

interface AppRoute {
  path: string;
  element: ReactNode;
  requiresAuth: boolean;
  maintenanceAccess: MaintenanceAccess;
}

const appRoutes: AppRoute[] = [
  {
    path: 'home',
    element: <HomePage />,
    requiresAuth: false,
    maintenanceAccess: 'home',
  },
  {
    path: '',
    element: <TableListPage />,
    requiresAuth: true,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'composition',
    element: <TableCompositionPage />,
    requiresAuth: false,
    maintenanceAccess: 'guest-composition',
  },
  {
    path: 'overview/:type/:id',
    element: <TableOverviewPage />,
    requiresAuth: false,
    maintenanceAccess: 'guest-overview',
  },
  {
    path: 'table/customize/:id',
    element: <TimerPage />,
    requiresAuth: false,
    maintenanceAccess: 'guest-timer',
  },
  {
    path: 'table/customize/:id/end',
    element: <DebateEndPage />,
    requiresAuth: true,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'table/customize/:id/end/feedback',
    element: <FeedbackTimerPage />,
    requiresAuth: true,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'table/customize/:tableId/end/vote/:pollId',
    element: <DebateVotePage />,
    requiresAuth: true,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'table/customize/:tableId/end/vote/:pollId/result',
    element: <DebateVoteResultPage />,
    requiresAuth: true,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'vote/:id',
    element: <VoteParticipationPage />,
    requiresAuth: false,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'vote/end',
    element: <VoteCompletePage />,
    requiresAuth: false,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'oauth',
    element: <OAuth />,
    requiresAuth: false,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'share',
    element: <TableSharingPage />,
    requiresAuth: false,
    maintenanceAccess: 'blocked',
  },
  {
    path: 'live/:id',
    element: <AudienceSharePage />,
    requiresAuth: false,
    maintenanceAccess: 'blocked',
  },
  {
    path: '*',
    element: <NotFoundPage />,
    requiresAuth: false,
    maintenanceAccess: 'blocked',
  },
];

// 인증 보호 로직을 적용한 라우트
const guardedAppRoutes = appRoutes.map((route) => ({
  ...route,
  element: (
    <MaintenanceRoute access={route.maintenanceAccess}>
      {route.requiresAuth ? (
        <ProtectedRoute>{route.element}</ProtectedRoute>
      ) : (
        route.element
      )}
    </MaintenanceRoute>
  ),
}));

const router = createBrowserRouter(
  [
    {
      element: (
        <>
          <ErrorBoundaryWrapper />
          <BackActionHandler />
        </>
      ),
      children: [
        {
          path: '/',
          element: <LanguageWrapper />,
          children: guardedAppRoutes, // 기본 언어(ko) 라우트
        },
        {
          path: ':lang', // 다른 언어 라우트
          element: <LanguageWrapper />,
          children: guardedAppRoutes,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.VITE_BASE_PATH || '/',
  },
);

export default router;
