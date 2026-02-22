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
import FeedbackTimerPage from '../page/TimerPage/FeedbackTimerPage';
import LandingPage from '../page/LandingPage/LandingPage';
import TableSharingPage from '../page/TableSharingPage/TableSharingPage';
import DebateEndPage from '../page/DebateEndPage/DebateEndPage';
import DebateVotePage from '../page/DebateVotePage/DebateVotePage';
import VoteParticipationPage from '../page/VoteParticipationPage/VoteParticipationPage';
import VoteCompletePage from '../page/VoteCompletePage/VoteCompletePage';
import DebateVoteResultPage from '../page/DebateVoteResultPage/DebateVoteResultPage';
import LanguageWrapper from './LanguageWrapper';
import UpdateModalWrapper from '../components/UpdateModal/UpdateModalWrapper';

const appRoutes = [
  {
    path: 'home',
    element: <LandingPage />,
    requiresAuth: false,
  },
  {
    path: '',
    element: <TableListPage />,
    requiresAuth: true,
  },
  {
    path: 'composition',
    element: <TableCompositionPage />,
    requiresAuth: false,
  },
  {
    path: 'overview/:type/:id',
    element: <TableOverviewPage />,
    requiresAuth: false,
  },
  {
    path: 'table/customize/:id',
    element: <TimerPage />,
    requiresAuth: false,
  },
  {
    path: 'table/customize/:id/end',
    element: <DebateEndPage />,
    requiresAuth: true,
  },
  {
    path: 'table/customize/:id/end/feedback',
    element: <FeedbackTimerPage />,
    requiresAuth: true,
  },
  {
    path: 'table/customize/:tableId/end/vote/:pollId',
    element: <DebateVotePage />,
    requiresAuth: true,
  },
  {
    path: 'table/customize/:tableId/end/vote/:pollId/result',
    element: <DebateVoteResultPage />,
    requiresAuth: true,
  },
  {
    path: 'vote/:id',
    element: <VoteParticipationPage />,
    requiresAuth: false,
  },
  {
    path: 'vote/end',
    element: <VoteCompletePage />,
    requiresAuth: false,
  },
  {
    path: 'oauth',
    element: <OAuth />,
    requiresAuth: false,
  },
  {
    path: 'share',
    element: <TableSharingPage />,
    requiresAuth: false,
  },
  {
    path: '*',
    element: <NotFoundPage />,
    requiresAuth: false,
  },
];

// 인증 보호 로직을 적용한 라우트
const protectedAppRoutes = appRoutes.map((route) => ({
  ...route,
  element: route.requiresAuth ? (
    <ProtectedRoute>{route.element}</ProtectedRoute>
  ) : (
    route.element
  ),
}));

const router = createBrowserRouter([
  {
    element: (
      <>
        <ErrorBoundaryWrapper />
        <BackActionHandler />
        <UpdateModalWrapper />
      </>
    ),
    children: [
      {
        path: '/',
        element: <LanguageWrapper />,
        children: protectedAppRoutes, // 기본 언어(ko) 라우트
      },
      {
        path: ':lang', // 다른 언어 라우트
        element: <LanguageWrapper />,
        children: protectedAppRoutes,
      },
    ],
  },
]);

// 라우트 변경 시 Google Analytics 이벤트 전송
router.subscribe(({ location }) => {
  ReactGA.send({ hitType: 'pageview', page: location.pathname });
});

export default router;
