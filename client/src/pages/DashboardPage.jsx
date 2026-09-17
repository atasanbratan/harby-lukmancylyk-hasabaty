import { useMemo } from 'react';
import { useAppState } from '../lib/AppState';
import { CONCERNS } from '../lib/constants';

export default function DashboardPage() {
  const { soldiers } = useAppState();

  const { stats, concernReports, unitBars } = useMemo(() => {
    const concernCounts = new Map(CONCERNS.map(({ key }) => [key, 0]));
    const periodCounts = new Map();
    const unitCounts = new Map();

    soldiers.forEach((record) => {
      // A person may belong to several categories, but only once to each.
      const concernKeys = new Set((record.concerns || []).map((concern) => concern?.key));
      concernKeys.forEach((key) => {
        if (concernCounts.has(key)) concernCounts.set(key, concernCounts.get(key) + 1);
      });

      const period = record.callUpPeriod || '—';
      periodCounts.set(period, (periodCounts.get(period) || 0) + 1);
      const unit = record.unit || '—';
      unitCounts.set(unit, (unitCounts.get(unit) || 0) + 1);
    });

    const topPeriod = [...periodCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const maxUnit = Math.max(1, ...unitCounts.values());

    return {
      stats: [
        { label: 'Jemi ýazgy', value: String(soldiers.length), note: 'hasabatda' },
        { label: 'Köp çagyrylyş', value: topPeriod?.[0] || '—', note: `${topPeriod?.[1] || 0} ýazgy` },
      ],
      concernReports: CONCERNS.map((concern) => ({
        ...concern,
        count: concernCounts.get(concern.key),
        pct: soldiers.length ? Math.round((concernCounts.get(concern.key) / soldiers.length) * 100) : 0,
      })),
      unitBars: [...unitCounts.keys()].sort().map((unit) => ({
        unit, count: unitCounts.get(unit), pct: Math.round((unitCounts.get(unit) / maxUnit) * 100),
      })),
    };
  }, [soldiers]);

  return (
    <main style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: 24 }}>
      <span className="condensed" style={{ display: 'block', fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
        Jemi görkeziji
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: '18px 20px' }}>
            <span className="mono" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>{s.label}</span>
            <span className="condensed" style={{ fontWeight: 700, fontSize: 32, color: 'var(--text-strong)', display: 'block', lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>{s.note}</span>
          </div>
        ))}
      </div>

      <section aria-labelledby="concern-report-heading" style={{ marginBottom: 28 }}>
        <h2 id="concern-report-heading" className="condensed" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
          Aýratyn gözegçilik kategoriýalary
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
          Bir adam birnäçe kategoriýa degişli bolup biler. Şonuň üçin kategoriýalaryň sanlarynyň jemi umumy ýazgy sanyndan köp bolup biler. Göterimler ähli ýazgylaryň sanyna görä hasaplanýar.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: 14 }}>
          {concernReports.map((report) => (
            <article key={report.key} style={{ minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: 'var(--text-strong)', overflowWrap: 'anywhere' }}>
                {report.label}
              </h3>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <span className="condensed" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, color: 'var(--accent)' }}>
                  {report.count}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 7, color: 'var(--text-muted)' }}>adam</span>
                </span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{report.pct}%</span>
              </div>
              <div aria-hidden="true" style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--accent-soft)', marginTop: 12 }}>
                <div style={{ height: '100%', width: `${report.pct}%`, background: 'var(--accent)', transition: 'width 240ms ease-out' }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)', padding: '12px 16px' }}>
          <span className="condensed" style={{ fontWeight: 600, fontSize: 15, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-strong)' }}>Bölümçe boýunça ýazgy</span>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {unitBars.length === 0 && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Maglumat ýok.</span>}
          {unitBars.map((b) => (
            <div key={b.unit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: 'var(--text)', overflowWrap: 'anywhere' }}>{b.unit}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{b.count}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--accent-soft)' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: 'var(--accent)', transition: 'width 240ms ease-out' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
