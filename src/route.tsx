import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './page/LoginPage/LoginPage';
import TableListPage from './page/TableListPage/TableListPage';
import TableOverview from './page/TableOverviewPage/TableOverview';
import TimerPage from './page/TimerPage/TimerPage';
import { DebateInfo } from './type/type';

const debateInfoItems: DebateInfo[] = [
  { stance: 'PROS', debateType: 'OPENING', time: 180, speakerNumber: 1 },
  { stance: 'CONS', debateType: 'OPENING', time: 180, speakerNumber: 1 },
  { stance: 'NEUTRAL', debateType: 'TIME_OUT', time: 60 },
  { stance: 'PROS', debateType: 'CLOSING', time: 180, speakerNumber: 2 },
  { stance: 'CONS', debateType: 'CLOSING', time: 180, speakerNumber: 2 },
];

const router = createBrowserRouter([
  {
    path: '/',
    // element: <TableSetup />,
    element: <TimerPage debateInfoItems={debateInfoItems} />,
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
