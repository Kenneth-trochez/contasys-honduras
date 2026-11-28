import type { Rol, Usuario } from './usuarios.types';

export const ROLES_PRUEBA: Rol[] = [
  { id_rol: 1, nombre_rol: 'Administrador' },
  { id_rol: 2, nombre_rol: 'Contador' },
  { id_rol: 3, nombre_rol: 'Auxiliar contable' },
];

export const USUARIOS_PRUEBA: Usuario[] = [
  {
    id_usuario: 1,
    nombre_completo: 'Admin ContaSys',
    email: 'admin@contasys.hn',
    id_rol: 1,
    estado: 'Activo',
    fecha_creacion: '2026-10-01',
  },
  {
    id_usuario: 2,
    nombre_completo: 'Karla Zúniga',
    email: 'karla.zuniga@contasys.hn',
    id_rol: 2,
    estado: 'Activo',
    fecha_creacion: '2026-10-14',
  },
  {
    id_usuario: 3,
    nombre_completo: 'Mario Reyes',
    email: 'mario.reyes@contasys.hn',
    id_rol: 3,
    estado: 'Activo',
    fecha_creacion: '2026-11-02',
  },
  {
    id_usuario: 4,
    nombre_completo: 'Daniela Ponce',
    email: 'daniela.ponce@contasys.hn',
    id_rol: 3,
    estado: 'Inactivo',
    fecha_creacion: '2026-09-20',
  },
];
