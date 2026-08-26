import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../lib/AppState';
import {
  blankSoldier, blankEvent, PERIODS, REGIONS, KINDS, RANKS, CONCERNS,
  ASSIGNED_PERSONNEL_OPTIONS, ALERT,
} from '../lib/constants';
import * as api from '../lib/api';

function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return resolve(null);
    if (file.size > 2 * 1024 * 1024 * 4) return resolve(null);
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 720;
        const sc = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * sc);
        cv.height = Math.round(img.height * sc);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function FormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { soldiers, refresh, askDiscard } = useAppState();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(() => {
    if (isEdit) {
      const src = soldiers.find((r) => r.id === id);
      return src ? JSON.parse(JSON.stringify(src)) : blankSoldier();
    }
    return blankSoldier();
  });
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveFail, setSaveFail] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const src = soldiers.find((r) => r.id === id);
      if (src) setDraft(JSON.parse(JSON.stringify(src)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setField = (k, v) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
    setSaveFail(false);
  };

  const setEventField = (i, k, v) => {
    setDraft((d) => {
      const evs = d.medicalEvents.slice();
      evs[i] = { ...evs[i], [k]: v };
      return { ...d, medicalEvents: evs };
    });
    setDirty(true);
  };

  const addEvent = () => {
    setDraft((d) => ({ ...d, medicalEvents: [...(d.medicalEvents || []), blankEvent()] }));
    setDirty(true);
  };

  const removeEvent = (i) => {
    setDraft((d) => ({ ...d, medicalEvents: d.medicalEvents.filter((_, j) => j !== i) }));
    setDirty(true);
  };

  const onPhotoFile = async (file) => {
    if (!file) return;
    const url = await readPhoto(file);
    if (url) setField('photo', url);
  };

  const toggleConcern = (concern) => {
    setDraft((d) => {
      const cur = d.concerns || [];
      const exists = cur.some((c) => c.key === concern.key);
      const concerns = exists
        ? cur.filter((c) => c.key !== concern.key)
        : [...cur, { key: concern.key, label: concern.label, note: '' }];
      return { ...d, concerns };
    });
    setDirty(true);
  };

  const setConcernNote = (key, note) => {
    setDraft((d) => ({
      ...d,
      concerns: (d.concerns || []).map((c) => (c.key === key ? { ...c, note } : c)),
    }));
    setDirty(true);
  };

  const togglePersonnel = (name) => {
    setDraft((d) => {
      const cur = d.assignedPersonnel || [];
      const assignedPersonnel = cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name];
      return { ...d, assignedPersonnel };
    });
    setDirty(true);
  };

  const leave = () => {
    if (dirty) askDiscard(() => navigate('/'));
    else navigate('/');
  };

  const save = async () => {
    const nextErrors = {};
    if (!(draft.fullName || '').trim()) nextErrors.fullName = 'F.A.Aa hökmany.';
    if (!draft.birthDate) nextErrors.birthDate = 'Doglan senesi hökmany.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    setSaving(true);
    try {
      const saved = isEdit ? await api.updateSoldier(id, draft) : await api.createSoldier(draft);
      await refresh();
      setSaving(false);
      setDirty(false);
      navigate(`/soldier/${saved.id}`);
    } catch {
      setSaving(false);
      setSaveFail(true);
    }
  };

  const field = (key) => ({
    value: draft[key] == null ? '' : draft[key],
    onChange: (e) => setField(key, e.target.value),
    error: errors[key] || '',
  });

  const inputStyle = (error) => ({ borderColor: error ? ALERT : '#1F2C38' });

  const sectionTitleStyle = { fontWeight: 600, fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C9D6E0', display: 'block', marginBottom: 16 };

  return (
    <main style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button type="button" onClick={leave} className="mono" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8FA0AE', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          ← Yza
        </button>
        <span className="condensed" style={{ flex: 1, fontWeight: 700, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          {isEdit ? 'Ýazgyny üýtgetmek' : 'Täze esger'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section style={{ border: '1px solid #1F2C38', background: '#111821', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20 }}>
            <div>
              <span className="field-label">Surat</span>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onPhotoFile(f); }}
                style={{ position: 'relative', aspectRatio: '3/4', background: '#0C1218', border: '1px dashed #1F2C38', overflow: 'hidden' }}
              >
                {draft.photo ? (
                  <div style={{ width: '100%', height: '100%', backgroundImage: `url("${draft.photo}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div className="mono" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 10, letterSpacing: '.08em', color: '#3A4753', textAlign: 'center', padding: 8 }}>
                    Süýräň ýa-da saýlaň
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <label className="btn" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                  Saýla
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPhotoFile(e.target.files?.[0])} />
                </label>
                {draft.photo && (
                  <button type="button" className="btn" onClick={() => setField('photo', null)}>Arassala</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span className="field-label">Harby ady</span>
                <select className="field-input" {...field('rank')}>
                  <option value="">— saýlaň —</option>
                  {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <span className="field-label">F.A.Aa (Familiýasy Ady Atasynyň ady) *</span>
                <input className="field-input" style={inputStyle(errors.fullName)} {...field('fullName')} />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div>
                <span className="field-label">Doglan senesi *</span>
                <input type="date" className="field-input" style={inputStyle(errors.birthDate)} {...field('birthDate')} />
                {errors.birthDate && <span className="field-error">{errors.birthDate}</span>}
              </div>
              <div>
                <span className="field-label">Doglan ýeri</span>
                <input className="field-input" {...field('birthPlace')} />
              </div>
            </div>
          </div>
        </section>

        <section style={{ border: '1px solid #1F2C38', background: '#111821', padding: 20 }}>
          <span className="condensed" style={sectionTitleStyle}>Çagyryş</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <span className="field-label">Çagyrylyş möhleti</span>
              <select className="field-input" {...field('callUpPeriod')}>
                {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <span className="field-label">Welaýat</span>
              <select className="field-input" {...field('commissariatRegion')}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <span className="field-label">Harby wekillik (ŞHW/EHW)</span>
              <input className="field-input" {...field('commissariat')} placeholder="Mm. Balkanabat ŞHW" />
            </div>
          </div>
        </section>

        <section style={{ border: '1px solid #1F2C38', background: '#111821', padding: 20 }}>
          <span className="condensed" style={sectionTitleStyle}>Wezipe</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <span className="field-label">Batalýon</span>
              <input className="field-input" {...field('unit')} />
            </div>
            <div>
              <span className="field-label">Rota</span>
              <input className="field-input" {...field('company')} />
            </div>
            <div>
              <span className="field-label">Wzwod</span>
              <input className="field-input" {...field('platoon')} />
            </div>
          </div>
        </section>

        <section style={{ border: '1px solid #1F2C38', background: '#111821', padding: 20 }}>
          <span className="condensed" style={sectionTitleStyle}>Kesel kesgidi / sebäbi</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <span className="field-label">Kesel kesgidi ýa-da hasaba alynmagynyň sebäbi</span>
              <textarea className="field-input" rows={3} {...field('diagnosis')} />
            </div>
            <div>
              <span className="field-label">Maşgala barada bellik</span>
              <textarea className="field-input" rows={3} {...field('familyNote')} />
            </div>
          </div>
        </section>

        <section style={{ border: '1px solid #1F2C38', background: '#111821', padding: 20 }}>
          <span className="condensed" style={sectionTitleStyle}>Ýagdaý — aýratyn gözegçilik alamatlary</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CONCERNS.map((c) => {
              const active = (draft.concerns || []).find((x) => x.key === c.key);
              return (
                <div key={c.key}>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={Boolean(active)}
                      onChange={() => toggleConcern(c)}
                    />
                    <span>{c.label}</span>
                  </label>
                  {active && (
                    <input
                      className="field-input"
                      style={{ marginTop: 8, marginLeft: 25, width: 'calc(100% - 25px)' }}
                      placeholder="Bellik ýazyň…"
                      value={active.note}
                      onChange={(e) => setConcernNote(c.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ border: '1px solid #1F2C38', background: '#111821', padding: 20 }}>
          <span className="condensed" style={sectionTitleStyle}>Iş geçirmäge berkidilen harby gullukçy</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ASSIGNED_PERSONNEL_OPTIONS.map((name) => (
              <label key={name} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={(draft.assignedPersonnel || []).includes(name)}
                  onChange={() => togglePersonnel(name)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </section>

        <section style={{ border: '1px solid #1F2C38', background: '#111821', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <span className="condensed" style={{ flex: 1, ...sectionTitleStyle, marginBottom: 0 }}>Lukmançylyk wakalary</span>
            <button type="button" className="btn" onClick={addEvent}>+ Waka goş</button>
          </div>
          {(draft.medicalEvents || []).length === 0 ? (
            <span style={{ fontSize: 13, color: '#6B7C8C' }}>Waka ýok.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {draft.medicalEvents.map((e, i) => (
                <div key={i} style={{ border: '1px solid #1F2C38', padding: 14, position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => removeEvent(i)}
                    aria-label="Wakany aýyr"
                    style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid #1F2C38', color: '#8FA0AE', fontSize: 11, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, maxWidth: 'calc(100% - 40px)' }}>
                    <div>
                      <span className="field-label">Senesi</span>
                      <input type="date" className="field-input" value={e.date} onChange={(ev) => setEventField(i, 'date', ev.target.value)} />
                    </div>
                    <div>
                      <span className="field-label">Görnüşi</span>
                      <select className="field-input" value={e.kind} onChange={(ev) => setEventField(i, 'kind', ev.target.value)}>
                        {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span className="field-label">Edara</span>
                    <input className="field-input" value={e.facility} onChange={(ev) => setEventField(i, 'facility', ev.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <span className="field-label">Şäher</span>
                      <input className="field-input" value={e.city} onChange={(ev) => setEventField(i, 'city', ev.target.value)} />
                    </div>
                    <div>
                      <span className="field-label">Ýurt</span>
                      <input className="field-input" value={e.country} onChange={(ev) => setEventField(i, 'country', ev.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 40 }}>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saklanýar…' : 'Sakla'}
          </button>
          <button type="button" className="btn" onClick={leave}>Ýatyr</button>
          <span className="mono" style={{ fontSize: 11, color: saveFail ? ALERT : '#4C5A66' }}>
            {saveFail ? 'Ýazgy saklanmady. Gaýtadan synanyşyň.' : (dirty ? 'Saklanmadyk üýtgeşmeler bar.' : '')}
          </span>
        </div>
      </div>
    </main>
  );
}
