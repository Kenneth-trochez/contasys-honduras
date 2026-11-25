import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PerfilPage from '../pages/perfil/PerfilPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
