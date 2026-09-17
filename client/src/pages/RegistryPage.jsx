import { useMemo, useRef, useState } from 'react';
import { useAppState } from '../lib/AppState';
import { surname, searchIndex, abbreviateUnit } from '../lib/utils';
import { PERIODS, REGIONS, CONCERNS } from '../lib/constants';
import SoldierCard from '../components/SoldierCard';

// I-2024ý çagyryşy hasabatdan aýryldy — talap boýunça.
const FILTER_PERIODS = PERIODS.filter((p) => p !== 'I-2024ý');

const SORTS = [
  { value: 'surname', label: 'Familiýasy A→Z' },
  { value: 'birthDate', label: 'Doglan senesi' },
  { value: 'updatedAt', label: 'Soňky üýtgedilen' },
  { value: 'orderNo', label: 'T/b' },
];

export default function RegistryPage() {
  const { soldiers, loading } = useAppState();
  const [queryLive, setQueryLive] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('surname');
  const [grouped, setGrouped] = useState(false);
  const [filters, setFilters] = useState({ unit: [], period: [], region: [], concern: [] });
  const queryTimer = useRef(null);

  const onQuery = (e) => {
    const v = e.target.value;
    setQueryLive(v);
    clearTimeout(queryTimer.current);
    queryTimer.current = setTimeout(() => setQuery(v), 160);
  };

  const toggleFilter = (group, value) => {
    setFilters((f) => {
      const cur = f[group];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...f, [group]: next };
    });
  };

  const clearFilters = () => {
    setFilters({ unit: [], period: [], region: [], concern: [] });
    setQuery(''); setQueryLive('');
  };

  const unitsAll = useMemo(
    () => Array.from(new Set(soldiers.map((r) => r.unit).filter(Boolean))),
    [soldiers],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = soldiers.filter((r) => {
      if (q && searchIndex(r).indexOf(q) < 0) return false;
      if (filters.unit.length && !filters.unit.includes(r.unit)) return false;
      if (filters.period.length && !filters.period.includes(r.callUpPeriod)) return false;
      if (filters.region.length && !filters.region.includes(r.commissariatRegion)) return false;
      if (filters.concern.length) {
        const keys = (r.concerns || []).map((c) => c.key);
        if (!filters.concern.some((k) => keys.includes(k))) return false;
      }
      return true;
    });
    out = out.slice().sort((a, b) => {
      if (sort === 'birthDate') return (a.birthDate || '').localeCompare(b.birthDate || '');
      if (sort === 'updatedAt') return (b.updatedAt || 0) - (a.updatedAt || 0);
      if (sort === 'orderNo') return (a.orderNo || 0) - (b.orderNo || 0);
      return surname(a.fullName).localeCompare(surname(b.fullName), 'tr');
    });
    return out;
  }, [soldiers, query, filters, sort]);

  const activeCount = Object.values(filters).reduce((n, arr) => n + arr.length, 0) + (query ? 1 : 0);

  const filterRows = [
    { label: 'Bölümçe', group: 'unit', options: unitsAll.map((u) => ({ value: u, label: abbreviateUnit(u) })) },
    { label: 'Çagyrylyş', group: 'period', options: FILTER_PERIODS.map((p) => ({ value: p, label: p })) },
    { label: 'Welaýat', group: 'region', options: REGIONS.map((r) => ({ value: r, label: r })) },
    { label: 'Ýagdaýy', group: 'concern', options: CONCERNS.map((c) => ({ value: c.key, label: c.label })) },
  ];

  const groups = useMemo(() => {
    if (!grouped) return [];
    const map = {};
    list.forEach((r) => {
      const u = r.unit || 'Bölümçe görkezilmedik';
      (map[u] = map[u] || []).push(r);
    });
    return Object.keys(map).sort().map((u) => ({ unit: u, records: map[u] }));
  }, [grouped, list]);

  return (
    <main className="registry-page" style={{ position: 'relative', zIndex: 1, maxWidth: 1440, margin: '0 auto', padding: 24 }}>
      <div className="registry-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 'min(260px, 100%)' }}>
          <input
            type="search"
            aria-label="Gözleg"
            placeholder="At, bölümçe, harby wekillik, kesel kesgidi…"
            value={queryLive}
            onChange={onQuery}
            className="field-input registry-search"
            style={{ paddingLeft: 36, fontSize: 15 }}
          />
          <span aria-hidden="true" className="mono" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-muted)', pointerEvents: 'none' }}>⌕</span>
        </div>
        <label className="mono" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Tertip
          <select
            aria-label="Tertipleşdirme"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ maxWidth: '100%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-strong)', fontSize: 14, padding: '10px 12px', borderRadius: 6 }}
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setGrouped((g) => !g)}
          aria-label="Bölümçe boýunça toparla"
          aria-pressed={grouped}
          className="btn"
          style={{ fontSize: 13, letterSpacing: '.06em', ...(grouped ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-soft)' } : {}) }}
        >
          Bölümçe boýunça
        </button>
      </div>

      <div className="registry-filters" role="group" aria-label="Gözleg filtrleri" style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0', marginBottom: 20 }}>
        {filterRows.map((row) => (
          <div key={row.group} role="group" aria-label={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <span className="mono" style={{ flex: '0 0 118px', paddingTop: 8, fontSize: 12, lineHeight: 1.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{row.label}</span>
            <div style={{ display: 'flex', flex: '1 1 260px', minWidth: 0, flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
              {row.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip registry-filter-chip${filters[row.group].includes(opt.value) ? ' active' : ''}`}
                  aria-pressed={filters[row.group].includes(opt.value)}
                  onClick={() => toggleFilter(row.group, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, margin: '-8px 0 18px' }}>
          <span role="status" className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{list.length} netije</span>
          <button type="button" onClick={clearFilters} className="mono" style={{ fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '6px 0' }}>
            Filtrleri arassala
          </button>
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: 14 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', height: 210 }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, width: '38%', background: 'linear-gradient(90deg,transparent,var(--accent-soft),transparent)', animation: 'sweep 1.8s linear infinite' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && grouped && list.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {groups.map((g) => (
            <section key={g.unit}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, border: '1px solid var(--border)', background: 'var(--surface-muted)', padding: '9px 14px', marginBottom: 14 }}>
                <span className="condensed" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-strong)', overflowWrap: 'anywhere' }}>{g.unit}</span>
                <span aria-hidden="true" style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg,var(--border) 0 6px,transparent 6px 12px)' }} />
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.records.length} ýazgy</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: 14, alignItems: 'start' }}>
                {g.records.map((r, i) => <SoldierCard key={r.id} soldier={r} query={query} delay={Math.min(i, 12) * 30} />)}
              </div>
            </section>
          ))}
        </div>
      )}

      {!loading && !grouped && list.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: 14, alignItems: 'start' }}>
          {list.map((r, i) => <SoldierCard key={r.id} soldier={r} query={query} delay={Math.min(i, 12) * 30} />)}
        </div>
      )}

      {!loading && soldiers.length === 0 && (
        <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span className="condensed" style={{ fontWeight: 700, fontSize: 22, letterSpacing: '.12em', textTransform: 'uppercase' }}>Ýazgy ýok.</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Täze esger goşuň.</span>
          <a href="#/soldier/new" className="btn btn-primary" style={{ marginTop: 6 }}>+ Täze esger</a>
        </div>
      )}

      {!loading && soldiers.length > 0 && list.length === 0 && (
        <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span className="condensed" style={{ fontWeight: 700, fontSize: 20, letterSpacing: '.1em', textTransform: 'uppercase' }}>Gabat gelýän ýazgy tapylmady.</span>
          <button type="button" onClick={clearFilters} className="btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', fontSize: 13 }}>Filtrleri arassala</button>
        </div>
      )}
    </main>
  );
}
