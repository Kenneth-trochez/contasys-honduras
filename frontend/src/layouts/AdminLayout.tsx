import { Outlet } from 'react-router-dom';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const AdminLayout = () => {
  return (
    <div className="app-wrapper">

      <Navbar />

      <Sidebar />

      <main className="app-main">
        <div className="app-content">
          <div className="container-fluid p-4">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
};

export default AdminLayout;