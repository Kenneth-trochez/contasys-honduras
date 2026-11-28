import { useState } from 'react';

import type { Usuario } from './usuarios.types';
import { UsuariosApiError } from './usuarios.service';

interface ConfirmarEstadoModalProps {
  usuario: Usuario;
  onCerrar: () => void;
  onConfirmar: () => Promise<void>;
}

const ConfirmarEstadoModal = ({ usuario, onCerrar, onConfirmar }: ConfirmarEstadoModalProps) => {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const activarUsuario = usuario.estado === 'Inactivo';

  const confirmar = async () => {
    setError('');
    setProcesando(true);
    try {
      await onConfirmar();
    } catch (err) {
      setError(err instanceof UsuariosApiError ? err.message : 'No se pudo cambiar el estado del usuario.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{activarUsuario ? 'Activar usuario' : 'Desactivar usuario'}</h5>
              <button type="button" className="btn-close" onClick={onCerrar} disabled={procesando} />
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <p className="mb-0">
                ¿Seguro que deseas {activarUsuario ? 'activar' : 'desactivar'} a{' '}
                <strong>{usuario.nombre_completo}</strong>?
                {!activarUsuario && ' No podrá iniciar sesión mientras esté inactivo.'}
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCerrar} disabled={procesando}>
                Cancelar
              </button>
              <button
                type="button"
                className={`btn ${activarUsuario ? 'btn-success' : 'btn-danger'}`}
                onClick={confirmar}
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : activarUsuario ? 'Activar' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default ConfirmarEstadoModal;
