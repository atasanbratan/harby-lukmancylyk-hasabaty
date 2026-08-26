import { useMemo } from 'react';
import { useAppState } from '../lib/AppState';
import { statusOf } from '../lib/utils';
import { OK, ALERT, AMBER } from '../lib/constants';

export default function DashboardPage() {
  const { soldiers } = useAppState();

  const { stats, unitBars } = useMemo(() => {
    const byStatus = { ok: 0, warn: 0, alert: 0, none: 0 };
    soldiers.forEach((r) => { byStatus[statusOf(r).key] += 1; });

    const periodCounts = {};
    soldiers.forEach((r) => { periodCounts[r.callUpPeriod] = (periodCounts[r.callUpPeriod] || 0) + 1; });
    const topPeriod = Object.keys(periodCounts).sort((a, b) => periodCounts[b] - periodCounts[a])[0] || '—';

    const unitCounts = {};
    soldiers.forEach((r) => { const u = r.unit || '—'; unitCounts[u] = (unitCounts[u] || 0) + 1; });
    const maxUnit = Math.max(1, ...Object.values(unitCounts));

    return {
      stats: [
        { label: 'Jemi ýazgy', value: String(soldiers.length), color: '#E3ECF3', note: 'hasabatda' },
        { label: 'Bejergi alan', value: String(byStatus.ok), color: OK, note: 'hassahanada' },
        { label: 'Bejergi almadyk', value: String(byStatus.alert), color: ALERT, note: 'gözegçilik gerek' },
        { label: 'Köp çagyrylyş', value: topPeriod, color: AMBER, note: `${periodCounts[topPeriod] || 0} ýazgy` },
      ],
      unitBars: Object.keys(unitCounts).sort().map((u) => ({
        unit: u, count: unitCounts[u], pct: Math.round((unitCounts[u] / maxUnit) * 100),
      })),
    };
  }, [soldiers]);

  return (
    <main style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: 24 }}>
      <span className="condensed" style={{ display: 'block', fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
        Jemi görkeziji
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ border: '1px solid #1F2C38', background: '#111821', padding: '18px 20px' }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#6B7C8C', display: 'block', marginBottom: 10 }}>{s.label}</span>
            <span className="condensed" style={{ fontWeight: 700, fontSize: 32, color: s.color, display: 'block', lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: 12, color: '#6B7C8C', display: 'block', marginTop: 8 }}>{s.note}</span>
          </div>
        ))}
      </div>

      <section style={{ border: '1px solid #1F2C38', background: '#111821' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1F2C38', padding: '10px 16px' }}>
          <span className="condensed" style={{ fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C9D6E0' }}>Bölümçe boýunça ýazgy</span>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {unitBars.length === 0 && <span style={{ fontSize: 13, color: '#6B7C8C' }}>Maglumat ýok.</span>}
          {unitBars.map((b) => (
            <div key={b.unit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#C9D6E0' }}>{b.unit}</span>
                <span className="mono" style={{ fontSize: 12, color: '#8FA0AE' }}>{b.count}</span>
              </div>
              <div style={{ height: 6, background: '#0C1218', border: '1px solid #1F2C38' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: '#FFB627', transition: 'width 240ms ease-out' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
