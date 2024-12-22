import { Route, Routes } from 'react-router-dom';
import TableSetup from './page/TableSetupPage/TableSetup';
import LoginPage from './page/LoginPage/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<TableSetup />} />
    </Routes>
  );
}

export default App;
