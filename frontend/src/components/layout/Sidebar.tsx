

import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="app-sidebar bg-dark shadow" data-bs-theme="dark">
      <div className="sidebar-brand">
        <NavLink to="/dashboard" className="brand-link">
          <span className="brand-text fw-light">
            ContaSys Honduras
          </span>
        </NavLink>
      </div>

      <div className="sidebar-wrapper">
        <nav className="mt-2">
          <ul className="nav sidebar-menu flex-column" role="menu">

            <li className="nav-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <i className="nav-icon bi bi-speedometer2" />
                <p>Dashboard</p>
              </NavLink>
            </li>

            <li className="nav-header">GESTIÓN ADMINISTRATIVA</li>

            <li className="nav-item">
              <NavLink to="/usuarios" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-people" />
                <p>Usuarios</p>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/terceros" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-person-vcard" />
                <p>Terceros</p>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/productos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-box-seam" />
                <p>Productos</p>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/inventario" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-boxes" />
                <p>Inventario</p>
              </NavLink>
            </li>

            <li className="nav-header">GESTIÓN CONTABLE</li>

            <li className="nav-item">
              <NavLink to="/facturas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-receipt" />
                <p>Facturación</p>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/cuentas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-journal-text" />
                <p>Cuentas contables</p>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/asientos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-journal-check" />
                <p>Asientos contables</p>
              </NavLink>
            </li>

            <li className="nav-header">SISTEMA</li>

            <li className="nav-item">
              <NavLink to="/reportes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="nav-icon bi bi-bar-chart" />
                <p>Reportes</p>
              </NavLink>
            </li>

          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
