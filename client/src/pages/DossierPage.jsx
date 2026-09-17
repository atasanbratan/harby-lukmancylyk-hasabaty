import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../lib/AppState';
import { fmtDate, fmtStamp, initials, monitoringStatus, unitLabel } from '../lib/utils';
import { ALERT, AMBER, OK, KINDS, FREQUENCY_MAP, CONCERN_MAP } from '../lib/constants';

export default function DossierPage() {
  const { id } = useParams();
  const { soldiers, askDelete } = useAppState();
  const [reveal, setReveal] = useState(0);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rec = soldiers.find((r) => r.id === id);

  useEffect(() => {
    if (!rec) return;
    if (reduced) { setReveal(99); return; }
    setReveal(0);
    let n = 0;
    let t;
    const tick = () => {
      n += 1;
      setReveal(n);
      if (n < 6) t = setTimeout(tick, 110);
    };
    t = setTimeout(tick, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec?.id]);

  if (!rec) {
    return (
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: 24 }}>
        <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '56px 24px', textAlign: 'center' }}>
          <span className="condensed" style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase' }}>Ýazgy tapylmady.</span>
          <div style={{ marginTop: 16 }}>
            <Link to="/" className="btn">← Hasabata dolan</Link>
          </div>
        </div>
      </main>
    );
  }

  const status = monitoringStatus(rec);
  const flagged = status.alert;
  const concerns = rec.concerns || [];
  const assignedPersonnel = rec.assignedPersonnel || [];
  const frequency = FREQUENCY_MAP[rec.actionFrequency];
  const actionLog = (rec.actionLog || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const evs = (rec.medicalEvents || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const metaLines = [
    { label: 'Harby ady', value: rec.rank, mono: true },
    { label: 'F.A.Aa', value: rec.fullName, mono: false },
    { label: 'T/b', value: String(rec.orderNo || '—'), mono: true },
    { label: 'Bölümçesi', value: unitLabel(rec), mono: true },
  ];

  const blocks = [
    {
      title: 'Şahsy maglumatlar', tag: `ID ${rec.id}`,
      fields: [
        { label: 'Doglan senesi', value: fmtDate(rec.birthDate), mono: true },
        { label: 'Doglan ýeri', value: rec.birthPlace, mono: false },
      ],
    },
    {
      title: 'Çagyryş', tag: /ŞHW/i.test(rec.commissariat || '') ? 'ŞHW' : (/EHW/i.test(rec.commissariat || '') ? 'EHW' : '—'),
      fields: [
        { label: 'Çagyrylyş möhleti', value: rec.callUpPeriod, mono: true },
        { label: 'Welaýat', value: rec.commissariatRegion, mono: false },
        { label: 'Harby wekillik', value: rec.commissariat, mono: false },
      ],
    },
    {
      title: 'Wezipe', tag: `T/b ${rec.orderNo || '—'}`,
      fields: [
        { label: 'Batalýon', value: rec.unit, mono: false },
        { label: 'Rota', value: rec.company, mono: false },
        { label: 'Wzwod', value: rec.platoon, mono: false },
      ],
    },
    {
      title: 'Kesel kesgidi / sebäbi', tag: '',
      fields: [
        { label: 'Kesel kesgidi ýa-da hasaba alynmagynyň sebäbi', value: rec.diagnosis || 'Görkezilmedik.', mono: false },
        { label: 'Maşgala barada bellik', value: rec.familyNote || 'Bellik ýok.', mono: false },
      ],
    },
  ];

  return (
    <main style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: 24 }} data-print-plain>
      <div data-noprint style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Link to="/" className="mono" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>← Hasabata dolan</Link>
        <div style={{ flex: 1 }} />
        <button type="button" className="btn" onClick={() => window.print()}>Çap et</button>
        <Link to={`/soldier/${rec.id}/edit`} className="btn btn-primary">Üýtget</Link>
        <button type="button" className="btn btn-danger" onClick={() => askDelete(rec)}>Öçür</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px,320px) 1fr', gap: 32, alignItems: 'start' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative', padding: 10 }}>
            <div className={flagged ? 'soldier-card-alert' : undefined} style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', background: 'repeating-linear-gradient(45deg,var(--surface-muted) 0 6px,var(--surface-alt) 6px 12px)', border: `1px solid ${flagged ? 'var(--danger)' : 'var(--border)'}` }}>
              {rec.photo ? (
                <div role="img" aria-label={rec.fullName} style={{ width: '100%', height: '100%', backgroundImage: `url("${rec.photo}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                <div className="mono" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 11, letterSpacing: '.14em', color: 'var(--text-subtle)', textAlign: 'center', padding: 16 }}>
                  SURAT ÝOK<br />{initials(rec.fullName)}
                </div>
              )}
              <div
                data-noprint
                style={{
                  position: 'absolute', left: 0, right: 0, height: '24%',
                  background: 'linear-gradient(180deg,transparent,rgba(119,83,31,.12),rgba(119,83,31,.32),rgba(119,83,31,.12),transparent)',
                  animation: reduced ? 'none' : 'scanDown 900ms ease-out 120ms 1 both', pointerEvents: 'none',
                }}
              />
            </div>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: '1px solid var(--accent)', borderLeft: '1px solid var(--accent)' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTop: '1px solid var(--accent)', borderRight: '1px solid var(--accent)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottom: '1px solid var(--accent)', borderLeft: '1px solid var(--accent)' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottom: '1px solid var(--accent)', borderRight: '1px solid var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 10px' }}>
            {metaLines.map((m, i) => (
              <div key={m.label} style={{ opacity: reveal >= i + 1 ? 1 : 0, transform: reveal >= i + 1 ? 'none' : 'translateY(4px)', transition: 'opacity 140ms linear, transform 140ms linear' }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>{m.label}</span>
                <span className={m.mono ? 'mono' : 'condensed'} style={{ fontSize: m.mono ? 13 : 22, color: m.mono ? 'var(--text-muted)' : 'var(--text-strong)', letterSpacing: m.mono ? '.04em' : '.03em', lineHeight: 1.25, display: 'block' }}>
                  {m.value || '—'}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, border: `1px solid ${flagged ? 'var(--danger)' : 'var(--border)'}`, padding: '9px 11px', marginTop: 6, opacity: reveal >= 5 ? 1 : 0, transition: 'opacity 160ms' }}>
              <span className={flagged ? 'soldier-card-alert-label' : undefined} style={{ width: 7, height: 7, borderRadius: '50%', background: status.color, boxShadow: flagged ? '0 0 8px var(--danger)' : 'none' }} />
              <span className={`mono${flagged ? ' soldier-card-alert-label' : ''}`} style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: status.color }}>
                {status.label}
              </span>
            </div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-subtle)', letterSpacing: '.08em' }}>Soňky üýtgedilen · {fmtStamp(rec.updatedAt)}</span>
          </div>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0 }}>
          {blocks.map((b) => (
            <section key={b.title} style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
                <span className="condensed" style={{ fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text)' }}>{b.title}</span>
                <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg,var(--border) 0 5px,transparent 5px 10px)' }} />
                {b.tag && <span className="mono" style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{b.tag}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16 }}>
                {b.fields.map((f) => (
                  <div key={f.label}>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.label}</span>
                    <span className={f.mono ? 'mono' : ''} style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
              <span className="condensed" style={{ fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text)' }}>Lukmançylyk wakalary</span>
              <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg,var(--border) 0 5px,transparent 5px 10px)' }} />
              {evs.length > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{evs.length} ýazgy</span>}
            </div>
            <div style={{ padding: 16 }}>
              {evs.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Maglumat ýok.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {evs.map((e, i) => {
                    const dot = e.kind === KINDS[0] ? OK : (e.kind === KINDS[3] ? ALERT : AMBER);
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 90px 1fr', gap: 12, alignItems: 'start' }}>
                        <span style={{ width: 8, height: 8, marginTop: 5, borderRadius: '50%', background: dot, boxShadow: `0 0 6px ${dot}` }} />
                        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(e.date)}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 13, color: 'var(--text)' }}>{e.facility || '—'}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{[e.city, e.country].filter(Boolean).join(', ') || '—'}</span>
                          <span className="mono" style={{ fontSize: 11, color: dot }}>{e.kind || '—'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section style={{ border: `1px solid ${flagged ? 'var(--danger)' : 'var(--border)'}`, background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
              <span className="condensed" style={{ fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text)' }}>Aýratyn gözegçilik ýagdaýlary</span>
              <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg,var(--border) 0 5px,transparent 5px 10px)' }} />
              {concerns.length > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--danger)' }}>{concerns.length} bellik</span>}
            </div>
            <div style={{ padding: 16 }}>
              {concerns.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ýok.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {concerns.map((c) => (
                    <div key={c.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-strong)' }}>● {CONCERN_MAP[c.key] || c.label}</span>
                      {c.note && <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 16 }}>{c.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
              <span className="condensed" style={{ fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text)' }}>Iş geçirmäge berkidilen harby gullukçy</span>
              <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg,var(--border) 0 5px,transparent 5px 10px)' }} />
              {frequency && <span className="mono" style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Geçirilmeli iş: {frequency.label}</span>}
            </div>
            <div style={{ padding: 16 }}>
              {assignedPersonnel.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bellenilmedik.</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {assignedPersonnel.map((name) => (
                    <span key={name} className="mono" style={{ fontSize: 11, letterSpacing: '.04em', border: '1px solid var(--border)', padding: '6px 10px', color: 'var(--text)' }}>{name}</span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
              <span className="condensed" style={{ fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text)' }}>Geçirilen çäreleriň ýazgysy</span>
              <span style={{ flex: 1, height: 1, background: 'repeating-linear-gradient(90deg,var(--border) 0 5px,transparent 5px 10px)' }} />
              {actionLog.length > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{actionLog.length} ýazgy</span>}
            </div>
            <div style={{ padding: 16 }}>
              {actionLog.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ýazgy ýok.</span>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                    <thead>
                      <tr>
                        <th className="mono" style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 12px 8px 0', fontWeight: 400 }}>Senesi</th>
                        <th className="mono" style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 12px 8px 0', fontWeight: 400 }}>Geçirilen çäre</th>
                        <th className="mono" style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0 8px 0', fontWeight: 400 }}>Ýerine ýetiren</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionLog.map((e, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td className="mono" style={{ padding: '10px 12px 10px 0', fontSize: 12, color: 'var(--text-muted)', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                          <td style={{ padding: '10px 12px 10px 0', fontSize: 13, color: 'var(--text)', verticalAlign: 'top' }}>{e.description || '—'}</td>
                          <td style={{ padding: '10px 0', fontSize: 13, color: 'var(--text)', verticalAlign: 'top' }}>{e.performedBy || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
