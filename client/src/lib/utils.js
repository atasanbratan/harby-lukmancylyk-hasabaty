import { KINDS, OK, AMBER, ALERT, GREY, FREQUENCY_MAP } from './constants';

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

// -- Unit-name abbreviation ------------------------------------------
// "1-nji tankçylyk batalýony" -> "1TB", "2-nji motoatyjy batalýony" -> "2MAB",
// its "2-nji rota" -> "2MAR" (a company inherits its parent battalion's type
// letters), "2-nji bölüm" -> "2MAW".

const TYPE_ABBR = {
  'tankçylyk': 'T',
  'motoatyjy': 'MA',
  'aragatnaşyk': 'AR',
};
const LEVEL_ABBR = {
  'batalýony': 'B',
  'batalýon': 'B',
  'rota': 'R',
  'rotasy': 'R',
  'bölüm': 'W',
  'bölümi': 'W',
  'wzwod': 'W',
};

function splitOrdinal(text) {
  const m = (text || '').trim().match(/^(\d+)-nji\s+(.*)$/i);
  return m ? { ordinal: m[1], rest: m[2] } : { ordinal: '', rest: (text || '').trim() };
}

// Type letters only (e.g. "tankçylyk" from "1-nji tankçylyk batalýony" -> "T").
function typeAbbrOf(text) {
  const { rest } = splitOrdinal(text);
  const words = rest.split(/\s+/).filter(Boolean);
  if (words.length < 2) return '';
  const typeWords = words.slice(0, -1);
  const key = typeWords.join(' ').toLowerCase();
  return TYPE_ABBR[key] || typeWords.map((w) => w[0]?.toUpperCase() || '').join('');
}

function levelAbbrOf(text) {
  const { rest } = splitOrdinal(text);
  const words = rest.split(/\s+/).filter(Boolean);
  const levelWord = (words[words.length - 1] || '').toLowerCase();
  return LEVEL_ABBR[levelWord] || (levelWord[0] || '').toUpperCase();
}

// Abbreviates a battalion-level field on its own, e.g. rec.unit.
export function abbreviateUnit(unitText) {
  if (!unitText) return '—';
  const { ordinal } = splitOrdinal(unitText);
  return `${ordinal}${typeAbbrOf(unitText)}${levelAbbrOf(unitText)}` || unitText;
}

// Abbreviates a company/platoon field, inheriting the parent battalion's
// type letters (a plain "2-nji rota" carries no type of its own).
function abbreviateSub(text, parentUnitText, levelLetterFallback) {
  if (!text) return '';
  const { ordinal, rest } = splitOrdinal(text);
  const words = rest.split(/\s+/).filter(Boolean);
  // Own type words, if the field itself spells one out (rare, but supported).
  const ownType = words.length > 1 ? typeAbbrOf(text) : '';
  const type = ownType || typeAbbrOf(parentUnitText || '');
  const levelWord = (words[words.length - 1] || '').toLowerCase();
  const level = LEVEL_ABBR[levelWord] || levelLetterFallback;
  return `${ordinal}${type}${level}`;
}

export function abbreviateCompany(companyText, unitText) {
  return abbreviateSub(companyText, unitText, 'R');
}

export function abbreviatePlatoon(platoonText, unitText) {
  return abbreviateSub(platoonText, unitText, 'W');
}

export function unitLabel(rec) {
  const parts = [
    abbreviateUnit(rec.unit),
    abbreviateCompany(rec.company, rec.unit),
    abbreviatePlatoon(rec.platoon, rec.unit),
  ].filter(Boolean);
  return parts.join(' · ') || '—';
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

function daysBetween(fromIso, toDate) {
  const from = new Date(`${fromIso}T00:00:00`);
  const diffMs = toDate - from;
  return Math.floor(diffMs / 86400000);
}

// Three-state (plus "none") monitoring status for a soldier, driven by the
// concern list and how overdue the last logged action is against the
// selected follow-up frequency.
export function monitoringStatus(rec) {
  const concerns = rec.concerns || [];
  if (!concerns.length) {
    return { state: 'none', label: 'Aýratyn gözegçilik ýok', color: GREY, alert: false };
  }

  const freq = FREQUENCY_MAP[rec.actionFrequency];
  const log = (rec.actionLog || []).filter((e) => e.date).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const lastDate = log[0]?.date || null;

  if (freq) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = lastDate ? daysBetween(lastDate, today) >= freq.days : true;
    if (overdue) {
      return { state: 'alert', label: 'Iş geçirilmegi talap edýär', color: ALERT, alert: true };
    }
    return freq.days <= 7
      ? { state: 'ongoing', label: 'Yzygiderli gözegçilikde', color: AMBER, alert: false }
      : { state: 'temporary', label: 'Wagtlaýyn gözegçilikde', color: AMBER, alert: false };
  }
  // Flagged, but no follow-up cadence set yet — can't compute a due date.
  return { state: 'ongoing', label: 'Yzygiderli gözegçilikde', color: AMBER, alert: false };
}
