import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthState';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from || '/';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Ulanyjy ady ýa-da parol nädogry.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form
        onSubmit={submit}
        style={{ width: '100%', maxWidth: 360, border: '1px solid #1F2C38', background: '#111821', padding: 32 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="condensed" style={{ display: 'block', fontWeight: 700, fontSize: 18, letterSpacing: '.08em', textTransform: 'uppercase', color: '#E3ECF3' }}>
            Aýratyn gözegçilikde saklamak
          </span>
          <span className="mono" style={{ fontSize: 11, color: '#6B7C8C', letterSpacing: '.1em' }}>Ulgama giriş</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span className="field-label">Ulanyjy ady</span>
          <input
            className="field-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <span className="field-label">Parol</span>
          <input
            type="password"
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <div className="field-error" style={{ marginBottom: 16 }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Barlanýar…' : 'Gir'}
        </button>
      </form>
    </main>
  );
}
