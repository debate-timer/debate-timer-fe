import { createBrowserRouter } from 'react-router-dom';
import TableSetup from './page/TableSetupPage/TableSetup';
import LoginPage from './page/LoginPage/LoginPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TableSetup />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export default router;
