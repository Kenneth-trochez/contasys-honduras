import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="app-header navbar navbar-expand bg-body">
      <div className="container-fluid">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button
              className="nav-link"
              data-lte-toggle="sidebar"
              type="button"
              aria-label="Contraer o expandir menú lateral"
              title="Contraer o expandir menú"
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>
          </li>
          <li className="nav-item d-none d-md-block">
            <span className="nav-link fw-semibold">Sistema Contable</span>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto">
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle d-flex align-items-center"
              data-bs-toggle="dropdown"
              type="button"
              aria-expanded="false"
              aria-label="Abrir menú de usuario"
            >
              <i className="bi bi-person-circle me-2" aria-hidden="true" />
              <span>Administrador</span>
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <h6 className="dropdown-header">Mi cuenta</h6>
              </li>
              <li>
                <Link className="dropdown-item" to="/perfil">
                  <i className="bi bi-person me-2" aria-hidden="true" />
                  Mi perfil
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item text-muted"
                  type="button"
                  disabled
                  title="Se habilitará al integrar el inicio de sesión."
                >
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
                  Cerrar sesión
                  <span className="d-block small ms-4">Disponible al integrar autenticación</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
