import { createBrowserRouter } from 'react-router-dom';
import TableSetup from './page/TableSetupPage/TableSetup';
import LoginPage from './page/LoginPage/LoginPage';
import TableListPage from './page/TableListPage/TableListPage';
import TableOverview from './page/TableOverviewPage/TableOverview';

const router = createBrowserRouter([
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
]);

export default router;
