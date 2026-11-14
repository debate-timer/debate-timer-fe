import { useLocation } from 'react-router-dom';
import { getHeaderRole } from '../../../util/headerNavigation';
import GeneralHeaderContainer from './GeneralHeaderContainer';
import AudienceHeaderContainer from './AudienceHeaderContainer';
import TimerHeader from './TimerHeader';
import TimerHeaderTools from './TimerHeaderTools';
import LoginPrompt from '../../../components/LoginPrompt/LoginPrompt';
import useLoginPrompt from '../../../hooks/useLoginPrompt';

/** 페이지 데이터가 없거나 렌더 경계를 벗어난 오류에도 경로의 헤더 역할을 유지함. */
function TimerHeaderFallback() {
  const login = useLoginPrompt();
  return (
    <>
      <TimerHeader
        actions={<TimerHeaderTools onLogin={() => login.requestLogin()} />}
      />
      <LoginPrompt login={login} />
    </>
  );
}

export default function PageHeaderFallback() {
  const location = useLocation();
  const role = getHeaderRole(location.pathname);
  if (role === 'audience') {
    return <AudienceHeaderContainer />;
  }
  if (role === 'timer') {
    return <TimerHeaderFallback />;
  }
  return <GeneralHeaderContainer />;
}
