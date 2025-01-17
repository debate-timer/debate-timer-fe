import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './page/LoginPage/LoginPage';
import TableListPage from './page/TableListPage/TableListPage';
import TableOverview from './page/TableOverviewPage/TableOverview';
import TimerPage from './page/TimerPage/TimerPage';
import TableSetup from './page/TableSetupPage/TableSetup';
import ErrorBoundaryWrapper from './components/ErrorBoundary/ErrorBoundaryWrapper';

const router = createBrowserRouter([
  {
    element: <ErrorBoundaryWrapper />,
    children: [
      {
        path: '/',
        element: <TableSetup />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/table',
        element: <TableListPage />,
      },
      {
        path: '/overview/:id',
        element: <TableOverview />,
      },
      {
        path: '/table/parliamentary/:id',
        element: <TimerPage />,
      },
    ],
  },
]);

export default router;
