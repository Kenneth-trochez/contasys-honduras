import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { login as apiLogin, type Usuario } from '@/api/auth';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('contasys_token');
    const u = localStorage.getItem('contasys_usuario');
    if (t && u) {
      setToken(t);
      try {
        setUsuario(JSON.parse(u));
      } catch {
        setUsuario(null);
      }
    }
    setLoading(false);
  }, []);

  const doLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      setToken(res.token);
      setUsuario(res.usuario);
      localStorage.setItem('contasys_token', res.token);
      localStorage.setItem('contasys_usuario', JSON.stringify(res.usuario));
    } finally {
      setLoading(false);
    }
  };

  const doLogout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('contasys_token');
    localStorage.removeItem('contasys_usuario');
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        loading,
        login: doLogin,
        logout: doLogout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
};
