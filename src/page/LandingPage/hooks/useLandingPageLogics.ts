import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../../util/accessToken';
import { oAuthLogin } from '../../../util/googleAuth';
import useLogout from '../../../hooks/mutations/useLogout';
import { createTableShareUrl } from '../../../util/arrayEncoding';
import { SAMPLE_TABLE_DATA } from '../../../constants/sample_table';

const useLandingPageLogics = () => {
  // Prepare dependencies
  const navigate = useNavigate();
  const { mutate: logoutMutate } = useLogout(() => navigate('/home'));

  // Declare functions that represent business logics
  const handleStartWithoutLogin = () => {
    // window.location.href = LANDING_URLS.START_WITHOUT_LOGIN_URL;
    window.location.href = createTableShareUrl(
      import.meta.env.VITE_SHARE_BASE_URL,
      SAMPLE_TABLE_DATA,
    );
  };
  const onTableSectionLoginButtonClicked = () => {
    if (!isLoggedIn()) {
      oAuthLogin();
    } else {
      navigate('/');
    }
  };
  const onDashboardButtonClicked = () => {
    navigate('/');
  };
  const onHeaderLoginButtonClicked = () => {
    if (!isLoggedIn()) {
      oAuthLogin();
    } else {
      logoutMutate();
    }
  };

  return [
    handleStartWithoutLogin,
    onTableSectionLoginButtonClicked,
    onDashboardButtonClicked,
    onHeaderLoginButtonClicked,
  ];
};

export default useLandingPageLogics;
