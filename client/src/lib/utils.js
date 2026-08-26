import { KINDS, OK, AMBER, ALERT, GREY } from './constants';

export function fmtDate(iso) {
  if (!iso) return '—';
  const p = String(iso).slice(0, 10).split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso;
}

export function fmtStamp(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  const z = (n) => String(n).padStart(2, '0');
  return `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`;
}

export function surname(name) {
  return (name || '').trim().split(/\s+/)[0] || '';
}

export function initials(name) {
  return (
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => (w[0] || '').toUpperCase())
      .join('.') || '—'
  );
}

export function unitLabel(rec) {
  return [rec.unit, rec.company, rec.platoon].filter(Boolean).join(' · ') || '—';
}

export function commissariatType(commissariat) {
  if (/ŞHW/i.test(commissariat || '')) return 'ŞHW';
  if (/EHW/i.test(commissariat || '')) return 'EHW';
  return '—';
}

export function statusOf(rec) {
  const evs = rec.medicalEvents || [];
  if (!evs.length) return { color: GREY, label: 'Maglumat ýok', key: 'none' };
  const last = evs.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  if (last.kind === KINDS[3]) return { color: ALERT, label: 'Bejergi almadyk', key: 'alert' };
  if (last.kind === KINDS[0]) return { color: OK, label: 'Bejergi alan', key: 'ok' };
  return { color: AMBER, label: 'Barlagda / öýde', key: 'warn' };
}

export function searchIndex(rec) {
  return [
    rec.fullName, rec.rank, rec.unit, rec.company, rec.platoon,
    rec.commissariat, rec.commissariatRegion, rec.diagnosis, rec.familyNote, rec.birthPlace,
    (rec.medicalEvents || []).map((e) => [e.facility, e.city, e.country, e.kind].join(' ')).join(' '),
    (rec.concerns || []).map((c) => [c.label, c.note].join(' ')).join(' '),
  ].join(' ').toLowerCase();
}

// Whether a soldier is flagged under any special-monitoring concern.
export function needsAttention(rec) {
  return Boolean((rec.concerns || []).length);
}
