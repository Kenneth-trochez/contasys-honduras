import client from './client';

export type TipoTercero = 'Cliente' | 'Proveedor' | 'Ambos';
export type EstadoTercero = 'Activo' | 'Inactivo';

export interface Tercero {
  id_tercero: number;
  tipo_tercero: TipoTercero;
  nombre_razon_social: string;
  rtn: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: EstadoTercero;
}

export interface FiltrosTercero {
  tipo?: string;
  estado?: string;
  buscar?: string;
}

export interface TerceroInput {
  tipo_tercero: TipoTercero;
  nombre_razon_social: string;
  rtn?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estado?: EstadoTercero;
}

export const listarTerceros = (filtros: FiltrosTercero = {}): Promise<Tercero[]> =>
  client.get<{ success: boolean; data: Tercero[] }>('/terceros', { params: filtros }).then((r) => r.data.data);

export const obtenerTercero = (id: number): Promise<Tercero> =>
  client.get<{ success: boolean; data: Tercero }>(`/terceros/${id}`).then((r) => r.data.data);

export const crearTercero = (data: TerceroInput): Promise<Tercero> =>
  client.post<{ success: boolean; data: Tercero }>('/terceros', data).then((r) => r.data.data);

export const actualizarTercero = (id: number, data: TerceroInput): Promise<Tercero> =>
  client.put<{ success: boolean; data: Tercero }>(`/terceros/${id}`, data).then((r) => r.data.data);

export const cambiarEstadoTercero = (id: number, estado: EstadoTercero): Promise<Tercero> =>
  client.patch<{ success: boolean; data: Tercero }>(`/terceros/${id}/estado`, { estado }).then((r) => r.data.data);
