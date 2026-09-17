import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtDate, unitLabel, initials, monitoringStatus } from '../lib/utils';
import { useAppState } from '../lib/AppState';

function highlightParts(fullName, query) {
  if (!query) return [{ t: fullName, hl: false }];
  const low = fullName.toLowerCase();
  const needle = query.toLowerCase();
  if (low.indexOf(needle) < 0) return [{ t: fullName, hl: false }];
  const parts = [];
  let idx = 0;
  while (true) {
    const at = low.indexOf(needle, idx);
    if (at < 0) { parts.push({ t: fullName.slice(idx), hl: false }); break; }
    if (at > idx) parts.push({ t: fullName.slice(idx, at), hl: false });
    parts.push({ t: fullName.slice(at, at + needle.length), hl: true });
    idx = at + needle.length;
  }
  return parts;
}

export default function SoldierCard({ soldier, query, delay = 0 }) {
  const { askDelete } = useAppState();
  const [hovered, setHovered] = useState(false);
  const status = monitoringStatus(soldier);
  const flagged = status.alert;
  const brColor = flagged ? 'var(--danger)' : (hovered ? 'var(--accent)' : 'var(--border)');
  const brSize = hovered ? 18 : 12;

  const corner = (top, left) => (
    <div
      style={{
        position: 'absolute', [top ? 'top' : 'bottom']: -1, [left ? 'left' : 'right']: -1,
        width: brSize, height: brSize,
        borderTop: top ? `1px solid ${brColor}` : 'none',
        borderBottom: !top ? `1px solid ${brColor}` : 'none',
        borderLeft: left ? `1px solid ${brColor}` : 'none',
        borderRight: !left ? `1px solid ${brColor}` : 'none',
        transition: 'all 160ms', pointerEvents: 'none',
      }}
    />
  );

  return (
    <div
      style={{ position: 'relative', animation: 'riseIn 240ms ease-out both', animationDelay: `${delay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/soldier/${soldier.id}`}
        className={`soldier-card${flagged ? ' soldier-card-alert' : ''}`}
        style={{
          display: 'grid', gridTemplateColumns: '92px 1fr', gap: 14,
          background: 'var(--surface)', border: `1px solid ${flagged ? 'var(--danger)' : (hovered ? 'var(--accent)' : 'var(--border)')}`,
          padding: 14, transition: 'border-color 160ms', color: 'var(--text)',
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface-muted)', aspectRatio: '3/4', border: '1px solid var(--border)' }}>
          {soldier.photo ? (
            <div
              role="img"
              aria-label="Şahsyýetiň suraty"
              style={{
                width: '100%', height: '100%', backgroundImage: `url("${soldier.photo}")`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                transform: hovered ? 'scale(1.02)' : 'scale(1)', transition: 'transform 160ms ease-out',
              }}
            />
          ) : (
            <div
              className="mono"
              style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, letterSpacing: '.1em', color: 'var(--text-subtle)',
                background: 'repeating-linear-gradient(45deg,var(--surface-muted) 0 5px,var(--surface-alt) 5px 10px)',
              }}
            >
              {initials(soldier.fullName)}
            </div>
          )}
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {soldier.rank || 'harby ady görkezilmedik'}
          </span>
          <span className="condensed clamp-2" style={{ fontWeight: 600, fontSize: 18, lineHeight: 1.15, letterSpacing: '.03em', color: 'var(--text-strong)', overflowWrap: 'anywhere' }}>
            {highlightParts(soldier.fullName, query).map((p, i) => (
              <span key={i} style={{ background: p.hl ? 'rgba(119,83,31,.12)' : 'transparent', color: p.hl ? 'var(--accent)' : 'inherit' }}>{p.t}</span>
            ))}
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(soldier.birthDate)}</span>
          <span className="clamp-1" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{soldier.birthPlace || '—'}</span>
          <span className="clamp-1" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unitLabel(soldier)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
            <span
              className={`mono${flagged ? ' soldier-card-alert-label' : ''}`}
              style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: flagged ? 'var(--danger)' : status.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              ● {status.label}
            </span>
            <span style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-subtle)', flexShrink: 0 }}>{soldier.callUpPeriod}</span>
          </div>
        </div>
      </Link>
      {corner(true, true)}
      {corner(true, false)}
      {corner(false, true)}
      {corner(false, false)}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6, opacity: hovered ? 1 : 0, transition: 'opacity 160ms' }}>
        <Link
          to={`/soldier/${soldier.id}/edit`}
          aria-label="Ýazgyny üýtget"
          style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', background: 'var(--header-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}
        >
          ✎
        </Link>
        <button
          type="button"
          aria-label="Ýazgyny öçür"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); askDelete(soldier); }}
          style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', background: 'var(--header-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
