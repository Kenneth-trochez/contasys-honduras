import axios, { AxiosError } from 'axios';

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('contasys_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('contasys_token');
      localStorage.removeItem('contasys_usuario');
      window.location.href = '/login';
    }
    const data: any = error.response?.data;
    const message =
      data?.message || error.message || 'Error al procesar la solicitud';
    const errors = Array.isArray(data?.errors) ? data.errors : undefined;
    return Promise.reject(new ApiError(message, error.response?.status ?? 500, errors));
  }
);

export default client;
