const DashboardPage = () => {
  return (
    <>
      <div className="app-content-header">
        <div className="container-fluid">
          <h3 className="mb-0">Dashboard</h3>
        </div>
      </div>

      <div className="app-content">
        <div className="container-fluid">

          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box text-bg-primary">
                <div className="inner">
                  <h3>0</h3>
                  <p>Productos registrados</p>
                </div>
                <i className="bi bi-box-seam small-box-icon" />
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box text-bg-success">
                <div className="inner">
                  <h3>0</h3>
                  <p>Facturas emitidas</p>
                </div>
                <i className="bi bi-receipt small-box-icon" />
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box text-bg-warning">
                <div className="inner">
                  <h3>0</h3>
                  <p>Usuarios registrados</p>
                </div>
                <i className="bi bi-people small-box-icon" />
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="small-box text-bg-danger">
                <div className="inner">
                  <h3>0</h3>
                  <p>Productos con stock bajo</p>
                </div>
                <i className="bi bi-exclamation-triangle small-box-icon" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Bienvenido a ContaSys Honduras
              </h3>
            </div>

            <div className="card-body">
              Panel administrativo del sistema contable.
              Desde aquí podrás gestionar los módulos del sistema.
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default DashboardPage;