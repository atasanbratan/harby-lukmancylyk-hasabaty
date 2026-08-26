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
export const CONCERNS = [
  { key: 'physicallyWeak', label: 'Fiziki taýdan gowşak esgerler' },
  { key: 'disciplineViolators', label: 'Tertip-düzgün bozýanlar' },
  { key: 'badHabits', label: 'Ýaramaz endikliler' },
  { key: 'orphansOrUnsupported', label: 'Ýetimler ýa-da maşgala taýdan goldawsyzlar' },
  { key: 'adaptationDifficulty', label: 'Uýgunlaşmakda kynçylyk çekýänler' },
  { key: 'suicideAttempt', label: 'Özi ýa-da ýakyn hossary suisid etmäge synanyşanlar' },
  { key: 'unstableFamily', label: 'Maşgalasy abadan däller' },
  { key: 'harshLivingConditions', label: 'Maşgalasynda ýaşaýyş-durmuş şertleri agyr bolanlar' },
  { key: 'policeRegistered', label: 'Polisiýa edarasynda bellige alnanlar' },
  { key: 'psychiatricHistory', label: 'Ruhy bozulma başdan geçiren ýa-da ruhy-newrologiýa hassahanada bejergi alanlar' },
  { key: 'illiterate', label: 'Okap-ýazyp bilmeýänler (sowatsyzlar)' },
  { key: 'draftEvader', label: 'Harby gulluga çagyrylyşdan gaçyp gezenler' },
  { key: 'marriedBeforeService', label: 'Harby gulluga çagyrylmanka öýlenenler' },
  { key: 'raisedInOrphanage', label: 'Çagalar öýünde terbiýelenenler' },
  { key: 'healthConditions', label: 'Sakawlyk, enurez (peşewini saklap bilmezlik), tutgaý (epilepsiýa) ýaly saglyk ýagdaýlary bolanlar' },
];

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
  };
}

export function blankEvent() {
  return { date: '', facility: '', city: '', country: 'Türkmenistan', kind: KINDS[0] };
}
