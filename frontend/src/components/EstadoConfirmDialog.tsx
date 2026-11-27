import type { EstadoTercero } from '@/api/terceros';

export interface EstadoConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  nombre: string;
  estadoActual: EstadoTercero;
  onConfirm: (nuevoEstado: EstadoTercero) => void;
  loading: boolean;
}

export function EstadoConfirmDialog({
  open,
  onClose,
  nombre,
  estadoActual,
  onConfirm,
  loading,
}: EstadoConfirmDialogProps) {
  if (!open) return null;
  const nuevoEstado: EstadoTercero = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Cambiar estado</span>
        </div>
        <div className="modal-body">
          <p>
            ¿Está seguro de cambiar el estado de <b>{nombre}</b> a{' '}
            <b>{nuevoEstado}</b>?
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onConfirm(nuevoEstado)}
            disabled={loading}
          >
            {loading ? 'Procesando...' : `Pasar a ${nuevoEstado}`}
          </button>
        </div>
      </div>
    </div>
  );
}
