const PerfilPage = () => {
  return (
    <>
      <div className="app-content-header">
        <div className="container-fluid">
          <h3 className="mb-0">Mi perfil</h3>
          <p className="text-secondary mb-0 mt-1">
            Información de la cuenta que utiliza el sistema.
          </p>
        </div>
      </div>

      <div className="app-content pt-3">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title">Información del usuario</h3>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-3 mb-4">
                    <div className="profile-avatar" aria-hidden="true">
                      <i className="bi bi-person-fill" />
                    </div>
                    <div className="text-center text-sm-start">
                      <h4 className="mb-1">Administrador</h4>
                      <span className="badge text-bg-primary">Rol de ejemplo</span>
                      <p className="text-secondary small mb-0 mt-2">
                        Datos provisionales. Se mostrarán los datos reales al integrar la autenticación.
                      </p>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered align-middle mb-0">
                      <tbody>
                        <tr>
                          <th scope="row" className="profile-label">Nombre completo</th>
                          <td>Administrador (provisional)</td>
                        </tr>
                        <tr>
                          <th scope="row" className="profile-label">Correo electrónico</th>
                          <td className="text-secondary">Pendiente de conectar con la API</td>
                        </tr>
                        <tr>
                          <th scope="row" className="profile-label">Rol</th>
                          <td>Administrador (provisional)</td>
                        </tr>
                        <tr>
                          <th scope="row" className="profile-label">Estado de sesión</th>
                          <td><span className="badge text-bg-secondary">Modo de desarrollo</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerfilPage;
