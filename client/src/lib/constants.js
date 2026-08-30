export const KINDS = [
  'Hassahanada bejergi alan',
  'Barlagda bolan',
  'Öýünde bejergi alan',
  'Bejergi almadyk',
];

export const REGIONS = ['Balkan', 'Daşoguz', 'Lebap', 'Mary', 'Ahal', 'Aşgabat'];
export const PERIODS = ['I-2024ý', 'II-2024ý', 'I-2025ý', 'II-2025ý', 'I-2026ý'];

export const RANKS = ['hatarçy', 'kiçi seržant', 'seržant', 'uly seržant'];

// "Aýratyn gözegçilik" categories — replaces the old treatment-status filter.
// Labels are the short forms used in the filter chips and the add-soldier form.
export const CONCERNS = [
  { key: 'physicallyWeak', label: 'Fiziki taýdan gowşak' },
  { key: 'disciplineViolators', label: 'Tertip-düzgün bozýanlar' },
  { key: 'badHabits', label: 'Ýaramaz endikliler' },
  { key: 'orphansOrUnsupported', label: 'Ýetimler ýa-da maşgala taýdan goldawsyzlar' },
  { key: 'adaptationDifficulty', label: 'Uýgunlaşmakda kynçylyk çekýänler' },
  { key: 'suicideAttempt', label: 'Suisid etmäge synanyşanlar' },
  { key: 'unstableFamily', label: 'Maşgalasy abadan däller' },
  { key: 'harshLivingConditions', label: 'Maşgalasynda ýaşaýyş-durmuş şertleri agyr bolanlar' },
  { key: 'policeRegistered', label: 'Polisiýa bellige alnanlar' },
  { key: 'psychiatricHistory', label: 'Ruhy bozulma başdan geçiren' },
  { key: 'illiterate', label: 'Okap-ýazyp bilmeýänler' },
  { key: 'draftEvader', label: 'Harby gulluga çagyrylyşdan gaçyp gezenler' },
  { key: 'marriedBeforeService', label: 'Harby gulluga çagyrylmanka öýlenenler' },
  { key: 'raisedInOrphanage', label: 'Çagalar öýünde terbiýelenenler' },
  { key: 'healthConditions', label: 'Sakawlyk, enurez, tutgaý ýaly saglyk ýagdaýlary bolanlar' },
];

// Live lookup so a label edit here updates every already-saved record's
// display without a data migration — records only ever persist the key.
export const CONCERN_MAP = Object.fromEntries(CONCERNS.map((c) => [c.key, c.label]));

// Personnel who can be assigned to follow up on a flagged soldier.
export const ASSIGNED_PERSONNEL_OPTIONS = [
  'Wzwod serkerdesi',
  'Rota serkerdesi',
  'RSTIBO',
  'Batalýon serkerdesi',
  'BSTIBO',
  'Harby bölümiň psihology',
  'Harby bölümiň lukmançylyk gullugynyň müdiri',
  'HBSTIBO',
];

// How often a flagged soldier needs a follow-up action. `days` drives the
// overdue/alert calculation in utils.js#monitoringStatus.
export const FREQUENCIES = [
  { value: 'daily', label: 'Her gün', days: 1 },
  { value: 'every3days', label: '3 günden 1', days: 3 },
  { value: 'weekly', label: 'Hepde-de 1', days: 7 },
  { value: 'biweekly', label: '2 Hepde-de 1', days: 14 },
  { value: 'monthly', label: 'Aýda 1', days: 30 },
];
export const FREQUENCY_MAP = Object.fromEntries(FREQUENCIES.map((f) => [f.value, f]));

export const OK = '#3FB68B';
export const AMBER = '#FFB627';
export const ALERT = '#E5484D';
export const GREY = '#6B7C8C';

export function blankSoldier() {
  return {
    id: null,
    photo: null,
    rank: '',
    fullName: '',
    birthPlace: '',
    birthDate: '',
    callUpPeriod: PERIODS[2],
    commissariatRegion: REGIONS[0],
    commissariat: '',
    unit: '',
    company: '',
    platoon: '',
    medicalEvents: [],
    diagnosis: '',
    familyNote: '',
    orderNo: 0,
    concerns: [],
    assignedPersonnel: [],
    actionFrequency: '',
    actionLog: [],
  };
}

export function blankEvent() {
  return { date: '', facility: '', city: '', country: 'Türkmenistan', kind: KINDS[0] };
}

export function blankActionLogEntry() {
  return { date: '', description: '', performedBy: '' };
}
