import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, AlertCircle, Lock } from 'lucide-react';

export function LoginPage() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@contasys.hn');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate('/terceros', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/terceros', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Credenciales inválidas. Intenta admin@contasys.hn / Admin123!');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand">ContaSys <span>Honduras</span></span>
        </div>
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-sub">Accede al módulo de Terceros</p>
        {error && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="field-row">
            <div className="field">
              <span>Correo electrónico</span>
              <div className="input-group">
                <Mail size={16} strokeWidth={1.5} />
                <input
                  type="email"
                  placeholder="admin@contasys.hn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <span>Contraseña</span>
              <div className="input-group">
                <Lock size={16} strokeWidth={1.5} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
        <div className="creds">
          <User size={14} strokeWidth={1.5} />{' '}
          Prueba: <b>admin@contasys.hn</b> / <b>Admin123!</b>
        </div>
      </div>
    </div>
  );
}
