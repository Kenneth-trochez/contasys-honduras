import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  listarTerceros,
  cambiarEstadoTercero,
  type Tercero,
} from '@/api/terceros';
import { EstadoConfirmDialog } from '@/components/EstadoConfirmDialog';
import { Search, Edit, EyeOff, Eye, Plus } from 'lucide-react';

const TIPO_OPTIONS: ('Cliente' | 'Proveedor' | 'Ambos')[] = [
  'Cliente',
  'Proveedor',
  'Ambos',
];
const ESTADO_OPTIONS: ('Activo' | 'Inactivo')[] = ['Activo', 'Inactivo'];

export function ListadoTerceros() {
  const navigate = useNavigate();
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [filtros, setFiltros] = useState<{
    tipo: string;
    estado: string;
    buscar: string;
  }>({ tipo: '', estado: '', buscar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<{
    open: boolean;
    id: number;
    nombre: string;
    estado: 'Activo' | 'Inactivo';
  } | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarTerceros({
        tipo: filtros.tipo || undefined,
        estado: filtros.estado || undefined,
        buscar: filtros.buscar || undefined,
      });
      setTerceros(data);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el listado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtros.tipo, filtros.estado, filtros.buscar]);

  const confirmarCambio = (
    id: number,
    nombre: string,
    estado: 'Activo' | 'Inactivo',
  ) => {
    setDialog({ open: true, id, nombre, estado });
  };

  const ejecutarCambio = async (nuevoEstado: 'Activo' | 'Inactivo') => {
    if (!dialog) return;
    setDialogLoading(true);
    try {
      await cambiarEstadoTercero(dialog.id, nuevoEstado);
      setDialog(null);
      await cargar();
    } catch (err: any) {
      setError(err?.message || 'No se pudo cambiar el estado');
    } finally {
      setDialogLoading(false);
    }
  };

  const estadoBadge = (estado: string) => (
    <span className={`badge badge-${estado.toLowerCase()}`}>{estado}</span>
  );

  const tipoBadge = (tipo: string) => (
    <span className={`badge badge-${tipo.toLowerCase()}`}>{tipo}</span>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Terceros</h1>
            <p className="page-sub">Gestión de clientes y proveedores</p>
          </div>
          <Link to="/terceros/nuevo">
            <button className="btn btn-primary">
              <Plus size={16} strokeWidth={1.5} /> Nuevo tercero
            </button>
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="filters">
          <div className="field">
            <span>Tipo</span>
            <select
              className="input select"
              value={filtros.tipo}
              onChange={(e) =>
                setFiltros({ ...filtros, tipo: e.target.value })
              }
            >
              <option value="">Todos</option>
              {TIPO_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <span>Estado</span>
            <select
              className="input select"
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
            >
              <option value="">Todos</option>
              {ESTADO_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={16} strokeWidth={1.5} />
            <input
              className="input"
              placeholder="Buscar por nombre o razón social..."
              value={filtros.buscar}
              onChange={(e) =>
                setFiltros({ ...filtros, buscar: e.target.value })
              }
            />
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>ID</th>
                    <th>Tipo</th>
                    <th>Nombre / Razón social</th>
                    <th style={{ width: 140 }}>RTN</th>
                    <th style={{ width: 130 }}>Teléfono</th>
                    <th style={{ width: 170 }}>Correo</th>
                    <th style={{ width: 100 }}>Estado</th>
                    <th style={{ width: 170 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {terceros.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty">
                        No se encontraron terceros.
                      </td>
                    </tr>
                  ) : (
                    terceros.map((t) => (
                      <tr key={t.id_tercero}>
                        <td>#{t.id_tercero}</td>
                        <td>{tipoBadge(t.tipo_tercero)}</td>
                        <td>{t.nombre_razon_social}</td>
                        <td>{t.rtn ?? '—'}</td>
                        <td>{t.telefono ?? '—'}</td>
                        <td>{t.email ?? '—'}</td>
                        <td>{estadoBadge(t.estado)}</td>
                        <td className="actions">
                          <Link to={`/terceros/${t.id_tercero}/editar`}>
                            <button
                              className="btn btn-outline btn-sm"
                              title="Editar"
                            >
                              <Edit size={16} strokeWidth={1.5} />
                            </button>
                          </Link>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() =>
                              confirmarCambio(
                                t.id_tercero,
                                t.nombre_razon_social,
                                t.estado,
                              )
                            }
                            title="Cambiar estado"
                          >
                            {t.estado === 'Activo' ? (
                              <EyeOff size={16} strokeWidth={1.5} />
                            ) : (
                              <Eye size={16} strokeWidth={1.5} />
                            )}
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

        {dialog && (
          <EstadoConfirmDialog
            open={dialog.open}
            onClose={() => setDialog(null)}
            nombre={dialog.nombre}
            estadoActual={dialog.estado}
            onConfirm={ejecutarCambio}
            loading={dialogLoading}
          />
        )}
      </div>
    </div>
  );
}

