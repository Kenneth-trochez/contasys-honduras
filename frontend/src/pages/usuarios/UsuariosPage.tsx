import { useEffect, useState } from 'react';

import UsuarioFormModal from './UsuarioFormModal';
import ConfirmarEstadoModal from './ConfirmarEstadoModal';
import { cambiarEstadoUsuario, crearUsuario, editarUsuario, listarRoles, listarUsuarios } from './usuarios.service';
import type { EstadoUsuario, Rol, Usuario, UsuarioInput } from './usuarios.types';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [buscar, setBuscar] = useState('');
  const [estado, setEstado] = useState<EstadoUsuario | ''>('');

  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioParaEstado, setUsuarioParaEstado] = useState<Usuario | null>(null);
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarUsuarios = async (filtros: { buscar: string; estado: EstadoUsuario | '' }) => {
    setCargando(true);
    setError('');
    try {
      const datosUsuarios = await listarUsuarios(filtros);
      setUsuarios(datosUsuarios);
    } catch {
      setError('No se pudo cargar el listado de usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    listarRoles().then(setRoles);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => cargarUsuarios({ buscar, estado }), 250);
    return () => clearTimeout(timeout);
  }, [buscar, estado]);

  useEffect(() => {
    if (!mensajeExito) return;
    const timeout = setTimeout(() => setMensajeExito(''), 2500);
    return () => clearTimeout(timeout);
  }, [mensajeExito]);

  const nombreRol = (idRol: number) => roles.find((rol) => rol.id_rol === idRol)?.nombre_rol ?? '—';

  const formatearFecha = (fecha: string) => {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  const coincideFiltros = (usuario: Usuario) => {
    const texto = buscar.trim().toLowerCase();
    const coincideBusqueda =
      !texto ||
      usuario.nombre_completo.toLowerCase().includes(texto) ||
      usuario.email.toLowerCase().includes(texto);
    const coincideEstado = !estado || usuario.estado === estado;
    return coincideBusqueda && coincideEstado;
  };

  const abrirCrear = () => {
    setUsuarioEnEdicion(null);
    setMostrarFormulario(true);
  };

  const abrirEditar = (usuario: Usuario) => {
    setUsuarioEnEdicion(usuario);
    setMostrarFormulario(true);
  };

  const guardarUsuario = async (datos: UsuarioInput) => {
    if (usuarioEnEdicion) {
      const actualizado = await editarUsuario(usuarioEnEdicion.id_usuario, datos);
      setUsuarios((prev) =>
        coincideFiltros(actualizado)
          ? prev.map((usuario) => (usuario.id_usuario === actualizado.id_usuario ? actualizado : usuario))
          : prev.filter((usuario) => usuario.id_usuario !== actualizado.id_usuario),
      );
      setMensajeExito('Usuario actualizado correctamente.');
    } else {
      const nuevo = await crearUsuario(datos);
      setUsuarios((prev) => (coincideFiltros(nuevo) ? [nuevo, ...prev] : prev));
      setMensajeExito('Usuario creado correctamente.');
    }
    setMostrarFormulario(false);
    setUsuarioEnEdicion(null);
  };

  const confirmarCambioEstado = async () => {
    if (!usuarioParaEstado) return;
    const nuevoEstado: EstadoUsuario = usuarioParaEstado.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const actualizado = await cambiarEstadoUsuario(usuarioParaEstado.id_usuario, nuevoEstado);
    setUsuarios((prev) =>
      coincideFiltros(actualizado)
        ? prev.map((usuario) => (usuario.id_usuario === actualizado.id_usuario ? actualizado : usuario))
        : prev.filter((usuario) => usuario.id_usuario !== actualizado.id_usuario),
    );
    setUsuarioParaEstado(null);
    setMensajeExito(`Usuario ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente.`);
  };

  return (
    <>
      {mensajeExito && (
        <div className="exito-check-overlay">
          <div className="exito-check-card">
            <svg className="exito-check-circulo" viewBox="0 0 52 52">
              <circle className="exito-check-circulo-trazo" cx="26" cy="26" r="24" fill="none" />
              <path className="exito-check-marca" fill="none" d="M14 27l7 7 16-16" />
            </svg>
            <p className="exito-check-texto mb-0">{mensajeExito}</p>
          </div>
        </div>
      )}

      <div className="app-content-header">
        <div className="container-fluid">
          <h3 className="mb-0">Usuarios</h3>
          <p className="text-secondary mb-0 mt-1">Gestión de usuarios y roles del sistema.</p>
        </div>
      </div>

      <div className="app-content pt-3">
        <div className="container-fluid">
          <div className="card card-primary card-outline">
            <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
              <h3 className="card-title">Listado de usuarios</h3>
              <button type="button" className="btn btn-primary" onClick={abrirCrear}>
                <i className="bi bi-plus-lg me-1" />
                Nuevo usuario
              </button>
            </div>

            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-sm-8 col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nombre o correo..."
                      value={buscar}
                      onChange={(e) => setBuscar(e.target.value)}
                    />
                    {buscar && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        title="Limpiar búsqueda"
                        onClick={() => setBuscar('')}
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-sm-4 col-md-3">
                  <select
                    className="form-select"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoUsuario | '')}
                  >
                    <option value="">Todos los estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nombre completo</th>
                      <th>Correo electrónico</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Fecha de creación</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <span className="spinner-border spinner-border-sm me-2" />
                          Cargando usuarios...
                        </td>
                      </tr>
                    ) : usuarios.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-secondary py-4">
                          No se encontraron usuarios con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      usuarios.map((usuario) => (
                        <tr key={usuario.id_usuario}>
                          <td>{usuario.nombre_completo}</td>
                          <td>{usuario.email}</td>
                          <td>{nombreRol(usuario.id_rol)}</td>
                          <td>
                            <span className={`badge ${usuario.estado === 'Activo' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                              {usuario.estado}
                            </span>
                          </td>
                          <td>{formatearFecha(usuario.fecha_creacion)}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm me-2"
                              title="Editar"
                              onClick={() => abrirEditar(usuario)}
                            >
                              <i className="bi bi-pencil" />
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${usuario.estado === 'Activo' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              title={usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                              onClick={() => setUsuarioParaEstado(usuario)}
                            >
                              <i className={`bi ${usuario.estado === 'Activo' ? 'bi-person-dash' : 'bi-person-check'}`} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mostrarFormulario && (
        <UsuarioFormModal
          usuario={usuarioEnEdicion}
          roles={roles}
          onCerrar={() => setMostrarFormulario(false)}
          onGuardar={guardarUsuario}
        />
      )}

      {usuarioParaEstado && (
        <ConfirmarEstadoModal
          usuario={usuarioParaEstado}
          onCerrar={() => setUsuarioParaEstado(null)}
          onConfirmar={confirmarCambioEstado}
        />
      )}
    </>
  );
};

export default UsuariosPage;
