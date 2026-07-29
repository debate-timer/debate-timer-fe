import LandingPage from '../LandingPage/LandingPage';
import MaintenancePage from '../MaintenancePage/MaintenancePage';
import { isMaintenanceModeEnabled } from '../../util/maintenanceMode';

export default function HomePage() {
  return isMaintenanceModeEnabled() ? <MaintenancePage /> : <LandingPage />;
}
