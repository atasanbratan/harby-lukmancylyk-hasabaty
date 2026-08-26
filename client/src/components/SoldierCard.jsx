import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtDate, unitLabel, initials, needsAttention } from '../lib/utils';
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
  const flagged = needsAttention(soldier);
  const brColor = flagged ? '#E5484D' : (hovered ? '#FFB627' : '#1F2C38');
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
          background: '#111821', border: `1px solid ${flagged ? '#E5484D' : (hovered ? '#FFB627' : '#1F2C38')}`,
          padding: 14, transition: 'border-color 160ms', color: '#C9D6E0',
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden', background: '#0C1218', aspectRatio: '3/4', border: '1px solid #1F2C38' }}>
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
                fontSize: 10, letterSpacing: '.1em', color: '#3A4753',
                background: 'repeating-linear-gradient(45deg,#0C1218 0 5px,#0E151C 5px 10px)',
              }}
            >
              {initials(soldier.fullName)}
            </div>
          )}
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#6B7C8C' }}>
            {soldier.rank || 'harby ady görkezilmedik'}
          </span>
          <span className="condensed clamp-2" style={{ fontWeight: 600, fontSize: 18, lineHeight: 1.15, letterSpacing: '.03em', color: '#E3ECF3', overflowWrap: 'anywhere' }}>
            {highlightParts(soldier.fullName, query).map((p, i) => (
              <span key={i} style={{ background: p.hl ? 'rgba(255,182,39,.22)' : 'transparent', color: p.hl ? '#FFB627' : 'inherit' }}>{p.t}</span>
            ))}
          </span>
          <span className="mono" style={{ fontSize: 12, color: '#8FA0AE' }}>{fmtDate(soldier.birthDate)}</span>
          <span className="clamp-1" style={{ fontSize: 12, color: '#6B7C8C' }}>{soldier.birthPlace || '—'}</span>
          <span className="clamp-1" style={{ fontSize: 12, color: '#8FA0AE' }}>{unitLabel(soldier)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
            {flagged ? (
              <span className="mono soldier-card-alert-label" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: '#E5484D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ● Iş geçirilmegi talap edýär
              </span>
            ) : (
              <span className="mono" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4C5A66' }}>Aýratyn gözegçilik ýok</span>
            )}
            <span style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10, color: '#4C5A66', flexShrink: 0 }}>{soldier.callUpPeriod}</span>
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
          style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', background: 'rgba(10,14,18,.9)', border: '1px solid #1F2C38', color: '#8FA0AE', fontSize: 12 }}
        >
          ✎
        </Link>
        <button
          type="button"
          aria-label="Ýazgyny öçür"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); askDelete(soldier); }}
          style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', background: 'rgba(10,14,18,.9)', border: '1px solid #1F2C38', color: '#8FA0AE', fontSize: 12, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
