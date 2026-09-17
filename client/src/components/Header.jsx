import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthState';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header
      data-noprint
      style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--header-bg)', backdropFilter: 'blur(6px)',
        borderBottom: '1px solid var(--border)', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 24px', maxWidth: 1440, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: 12, color: 'var(--text)' }}>
          <span className="condensed" style={{ fontWeight: 700, fontSize: 19, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Aýratyn gözegçilikde saklamak
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.1em' }}>PMR/2026</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/dashboard" className="btn">Jemi görkeziji</Link>
        <Link to="/soldier/new" className="btn btn-primary">+ Täze esger</Link>
        <button type="button" onClick={logout} className="btn" aria-label="Ulgamdan çyk">Çykyş</button>
      </div>
      <div
        style={{
          position: 'absolute', left: 0, bottom: 0, height: 1, width: '34%',
          background: 'linear-gradient(90deg,transparent,var(--accent),transparent)',
          animation: 'ambient 20s linear infinite',
        }}
      />
    </header>
  );
}
