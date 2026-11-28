import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { Rol, Usuario, UsuarioInput } from './usuarios.types';
import { UsuariosApiError } from './usuarios.service';

interface UsuarioFormModalProps {
  usuario: Usuario | null;
  roles: Rol[];
  onCerrar: () => void;
  onGuardar: (datos: UsuarioInput) => Promise<void>;
}

interface ValoresFormulario {
  nombre_completo: string;
  email: string;
  id_rol: string;
  password?: string;
}

const UsuarioFormModal = ({ usuario, roles, onCerrar, onGuardar }: UsuarioFormModalProps) => {
  const esEdicion = Boolean(usuario);
  const [errorServidor, setErrorServidor] = useState('');
  const [guardando, setGuardando] = useState(false);

  const esquema = z
    .object({
      nombre_completo: z.string().trim().min(3, 'Ingresa el nombre completo.'),
      email: z.string().trim().email('Ingresa un correo electrónico válido.'),
      id_rol: z.string().min(1, 'Selecciona un rol.'),
      password: z.string().optional(),
    })
    .superRefine((valores, ctx) => {
      if (!esEdicion && (!valores.password || valores.password.length < 6)) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'La contraseña debe tener al menos 6 caracteres.',
        });
      }
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValoresFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre_completo: usuario?.nombre_completo ?? '',
      email: usuario?.email ?? '',
      id_rol: usuario ? String(usuario.id_rol) : '',
      password: '',
    },
  });

  const onSubmit = async (valores: ValoresFormulario) => {
    setErrorServidor('');
    setGuardando(true);
    try {
      const datos: UsuarioInput = {
        nombre_completo: valores.nombre_completo.trim(),
        email: valores.email.trim(),
        id_rol: Number(valores.id_rol),
      };
      if (!esEdicion) {
        datos.password = valores.password;
      }
      await onGuardar(datos);
    } catch (error) {
      if (error instanceof UsuariosApiError) {
        setErrorServidor(error.message);
      } else {
        setErrorServidor('No se pudo guardar el usuario. Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-header">
                <h5 className="modal-title">{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</h5>
                <button type="button" className="btn-close" onClick={onCerrar} disabled={guardando} />
              </div>

              <div className="modal-body">
                {errorServidor && (
                  <div className="alert alert-danger" role="alert">
                    {errorServidor}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombre_completo ? 'is-invalid' : ''}`}
                    {...register('nombre_completo')}
                  />
                  {errors.nombre_completo && (
                    <div className="invalid-feedback">{errors.nombre_completo.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    {...register('email')}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>

                {!esEdicion && (
                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      {...register('password')}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>
                )}

                <div className="mb-1">
                  <label className="form-label">Rol</label>
                  <select
                    className={`form-select ${errors.id_rol ? 'is-invalid' : ''}`}
                    {...register('id_rol')}
                  >
                    <option value="">Selecciona un rol...</option>
                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>
                        {rol.nombre_rol}
                      </option>
                    ))}
                  </select>
                  {errors.id_rol && <div className="invalid-feedback">{errors.id_rol.message}</div>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onCerrar} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default UsuarioFormModal;
