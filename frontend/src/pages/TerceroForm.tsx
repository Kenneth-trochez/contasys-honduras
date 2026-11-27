import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  obtenerTercero,
  crearTercero,
  actualizarTercero,
  type TerceroInput,
  type TipoTercero,
  type EstadoTercero,
} from '@/api/terceros';
import { ApiError } from '@/api/client';
import { Save, ArrowLeft, Building2, Mail, Phone, MapPin } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FormularioTercero() {
  const { id } = useParams<{ id: string }>();
  const esEditar = Boolean(id);
  const navigate = useNavigate();
  const [tercero, setTercero] = useState<TerceroInput>({
    tipo_tercero: 'Cliente',
    nombre_razon_social: '',
    rtn: '',
    telefono: '',
    email: '',
    direccion: '',
    estado: 'Activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (esEditar && id) {
      cargar(id);
    }
  }, [esEditar, id]);

  const cargar = async (id: string) => {
    setLoading(true);
    setServerError('');
    try {
      const t = await obtenerTercero(Number(id));
      setTercero({
        tipo_tercero: t.tipo_tercero,
        nombre_razon_social: t.nombre_razon_social,
        rtn: t.rtn ?? '',
        telefono: t.telefono ?? '',
        email: t.email ?? '',
        direccion: t.direccion ?? '',
        estado: t.estado,
      });
    } catch (err: any) {
      setServerError(err?.message || 'No se pudo cargar el tercero');
    } finally {
      setLoading(false);
    }
  };

  const setField = (k: keyof TerceroInput, v: string) => {
    setTercero((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[k];
        return n;
      });
    }
  };

  const validar = (): boolean => {
    const n: Record<string, string> = {};
    if (!tercero.nombre_razon_social?.trim()) {
      n.nombre_razon_social = 'El nombre o razón social es obligatorio';
    }
    if (tercero.email && !EMAIL_REGEX.test(tercero.email)) {
      n.email = 'El correo electrónico no tiene un formato válido';
    }
    setErrors(n);
    return Object.keys(n).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validar()) return;

    setSaving(true);
    try {
      const payload: TerceroInput = {
        tipo_tercero: tercero.tipo_tercero,
        nombre_razon_social: tercero.nombre_razon_social.trim(),
        rtn: tercero.rtn || null,
        telefono: tercero.telefono || null,
        email: tercero.email || null,
        direccion: tercero.direccion || null,
      };
      if (!esEditar) {
        payload.estado = 'Activo';
      } else {
        payload.estado = tercero.estado;
      }

      if (esEditar && id) {
        await actualizarTercero(Number(id), payload);
      } else {
        await crearTercero(payload);
      }

      navigate('/terceros');
    } catch (err: any) {
      const errores = Array.isArray(err?.errors) ? err.errors.join('. ') : '';
      setServerError(errores || err?.message || 'Error al guardar el tercero');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <Link to="/terceros">
            <button className="btn btn-outline">
              <ArrowLeft size={16} strokeWidth={1.5} /> Volver
            </button>
          </Link>
          <h1 className="page-title">
            {esEditar ? 'Editar tercero' : 'Nuevo tercero'}
          </h1>
        </div>

        {serverError && (
          <div className="alert alert-danger" role="alert">{serverError}</div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="field-row">
                <div className="field">
                  <span>Tipo de tercero</span>
                  <select
                    className="input select"
                    value={tercero.tipo_tercero}
                    onChange={(e) => setField('tipo_tercero', e.target.value)}
                  >
                    <option value="Cliente">Cliente</option>
                    <option value="Proveedor">Proveedor</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
              </div>
              <div className="field-row form-full">
                <div className="field">
                  <span>
                    Nombre o razón social{' '}
                    <span style={{ color: '#b91c1c' }}>*</span>
                  </span>
                  <input
                    className={`input ${errors.nombre_razon_social ? 'error' : ''}`}
                    placeholder="Comercial La Esperanza"
                    value={tercero.nombre_razon_social}
                    onChange={(e) => setField('nombre_razon_social', e.target.value)}
                  />
                  {errors.nombre_razon_social && (
                    <p className="error-text">{errors.nombre_razon_social}</p>
                  )}
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <span>RTN</span>
                  <div className="input-group">
                    <Building2 size={16} strokeWidth={1.5} />
                    <input
                      className="input"
                      placeholder="0801-1999-12345"
                      value={tercero.rtn ?? ''}
                      onChange={(e) => setField('rtn', e.target.value)}
                    />
                  </div>
                  <p className="error-text" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    El RTN debe ser único si se proporciona.
                  </p>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <span>Teléfono</span>
                  <div className="input-group">
                    <Phone size={16} strokeWidth={1.5} />
                    <input
                      className="input"
                      placeholder="9876-5432"
                      value={tercero.telefono ?? ''}
                      onChange={(e) => setField('telefono', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <span>Correo electrónico</span>
                  <div className="input-group">
                    <Mail size={16} strokeWidth={1.5} />
                    <input
                      className={`input ${errors.email ? 'error' : ''}`}
                      type="email"
                      placeholder="contacto@example.com"
                      value={tercero.email ?? ''}
                      onChange={(e) => setField('email', e.target.value)}
                    />
                  </div>
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
              </div>
              <div className="field-row form-full">
                <div className="field">
                  <span>Dirección</span>
                  <div className="input-group">
                    <MapPin size={16} strokeWidth={1.5} />
                    <input
                      className="input"
                      placeholder="Tegucigalpa, Honduras"
                      value={tercero.direccion ?? ''}
                      onChange={(e) => setField('direccion', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {esEditar && (
                <div className="field-row">
                  <div className="field">
                    <span>Estado</span>
                    <select
                      className="input select"
                      value={tercero.estado}
                      onChange={(e) =>
                        setField('estado', e.target.value as EstadoTercero)
                      }
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="form-actions form-full">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <Save size={16} strokeWidth={1.5} />
                  {saving
                    ? 'Guardando...'
                    : esEditar
                    ? 'Actualizar'
                    : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
