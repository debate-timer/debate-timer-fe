import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './page/LoginPage/LoginPage';
import TableListPage from './page/TableListPage/TableListPage';
import TableOverview from './page/TableOverviewPage/TableOverview';
import TimerPage from './page/TimerPage/TimerPage';
import TableComposition from './page/TableComposition/TableComposition';
import ErrorBoundaryWrapper from './components/ErrorBoundary/ErrorBoundaryWrapper';

const router = createBrowserRouter([
  {
    element: <ErrorBoundaryWrapper />,
    children: [
      {
        path: '/',
        element: <LoginPage />,
      },
      {
        path: '/table',
        element: <TableListPage />,
      },
      {
        path: '/composition',
        element: <TableComposition />,
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
