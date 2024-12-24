import { createBrowserRouter } from 'react-router-dom';
import TableSetup from './page/TableSetupPage/TableSetup';
import LoginPage from './page/LoginPage/LoginPage';
import TableListPage from './page/TableListPage/TableListPage';

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
]);

export default router;
