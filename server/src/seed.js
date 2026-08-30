import { db, rowCount } from './db.js';
import { randomUUID } from 'node:crypto';

const KINDS = ['Hassahanada bejergi alan', 'Barlagda bolan', 'Öýünde bejergi alan', 'Bejergi almadyk'];

function ev(date, facility, city, country, kind) {
  return { date, facility, city, country, kind };
}
function concern(key, label, note) {
  return { key, label, note };
}
function action(date, description, performedBy) {
  return { date, description, performedBy };
}

function uid() {
  return 'r' + randomUUID().replace(/-/g, '').slice(0, 10);
}

// Relative to seed time so the demo data (overdue vs. on-schedule) stays
// meaningful no matter when the app is first run. Built from local date
// parts, not toISOString() — that converts to UTC and silently shifts the
// date by a day in any timezone ahead of UTC (as Turkmenistan is).
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rawSeed() {
  const B1 = '1-nji tankçylyk batalýony', B2 = '2-nji motoatyjy batalýony', B3 = '3-nji aragatnaşyk batalýony';
  return [
    // rank, fullName, birthPlace, birthDate, callUpPeriod, region, commissariat, unit, company, platoon,
    // medicalEvents, diagnosis, familyNote, concerns, assignedPersonnel, actionFrequency, actionLog
    ['hatarçy', 'Amanow Serdar Baýramowiç', 'Balkan wel., Balkanabat ş.', '2005-03-14', 'I-2025ý', 'Balkan', 'Balkanabat ŞHW', B1, '1-nji rota', '2-nji bölüm',
      [ev('2025-11-04', 'Balkanabat köpugurly hassahanasy', 'Balkanabat', 'Türkmenistan', KINDS[0])],
      'Aşgazan başynyň sowuklamasy (gastrit), 2025ý. noýabrda gaýtalanan. Iýmit düzgünine görä berhiz maslahat berildi.',
      'Maşgalasy doly, ene-atasy bilen aragatnaşygy yzygiderli.',
      [concern('physicallyWeak', 'Fiziki taýdan gowşak', 'Agramy kadadan pes, türgenleşiklerde ýadawlyk duýýar.')],
      ['Wzwod serkerdesi', 'Harby bölümiň lukmançylyk gullugynyň müdiri'],
      'every3days',
      [action(daysAgo(6), 'Fiziki taýýarlyk boýunça gözden geçirildi, iýmit tertibi barlanyldy.', 'Wzwod serkerdesi')]],

    ['kiçi seržant', 'Gurbanow Merdan Atajanowiç', 'Daşoguz wel., Boldumsaz etr.', '2004-07-22', 'II-2024ý', 'Daşoguz', 'Boldumsaz EHW', B1, '1-nji rota', '3-nji bölüm',
      [ev('2025-02-18', 'Enäniň we çaganyň saglygyny goraýyş merkezi', 'Daşoguz', 'Türkmenistan', KINDS[1])],
      'Gözüň görüş ýitiligi barlanyldy — çäklendirme ýok.',
      'Maşgalasy oba ýerinde ýaşaýar, ene-atasy sagdyn, gatnaşyk gowy.',
      [concern('disciplineViolators', 'Tertip-düzgün bozýanlar', 'Nobatçylyga gijä galmak ýagdaýlary bar, 2 gezek duýduryş berildi.')],
      ['Rota serkerdesi'],
      'weekly',
      [action(daysAgo(2), 'Tertip-düzgün boýunça söhbetdeşlik geçirildi, ýazmaça duýduryş berildi.', 'Rota serkerdesi')]],

    ['hatarçy', 'Şyhyýew Nurmuhammet Döwletgeldiýewiç', 'Lebap wel., Türkmenabat ş.', '2005-01-09', 'I-2025ý', 'Lebap', 'Türkmenabat ŞHW', B1, '2-nji rota', '1-nji bölüm',
      [],
      'Saglyk ýagdaýy kadaly, häzirki wagtda şikaýat ýok.',
      'Kakasy — Şyhyýew Döwletgeldi, 1978ý. — 2019ý. iş kesilen, häzir azatlykda. Ejesi bilen ýaşaýar.',
      [concern('orphansOrUnsupported', 'Ýetimler ýa-da maşgala taýdan goldawsyzlar', 'Kakasynyň iş kesilen döwri sebäpli maşgala goldawy çäkli bolan.')],
      ['RSTIBO', 'Harby bölümiň psihology'],
      'monthly',
      [action(daysAgo(5), 'Maşgala ýagdaýy barlanyldy, ruhy taýdan durnukly diýlip bahalandyryldy.', 'Harby bölümiň psihology')]],

    ['hatarçy', 'Ýazmyradow Kerim Öwezowiç', 'Mary wel., Ýolöten etr.', '2005-09-30', 'II-2025ý', 'Mary', 'Ýolöten EHW', B2, '1-nji rota', '1-nji bölüm',
      [ev('2026-01-12', 'Acıbadem hassahanasy', 'Istanbul', 'Türkiýe', KINDS[0]), ev('2026-03-02', 'Harby-lukmançylyk merkezi', 'Aşgabat', 'Türkmenistan', KINDS[1])],
      'Ýürek gapajygynyň dogabitdi kemçiligi — daşary ýurtda operasiýa edildi, häzir gözegçilikde.',
      'Maşgalasy Aşgabatda ýaşaýar, operasiýa üçin maliýe taýdan kömek etdiler.',
      [concern('healthConditions', 'Sakawlyk, enurez, tutgaý ýaly saglyk ýagdaýlary bolanlar', 'Ýürek operasiýasyndan soň agyr fiziki ýük çäklendirilmeli.')],
      ['Harby bölümiň lukmançylyk gullugynyň müdiri', 'BSTIBO'],
      'biweekly',
      [action(daysAgo(20), 'Kardiolog tarapyndan gaýtadan barlagdan geçirildi.', 'Harby bölümiň lukmançylyk gullugynyň müdiri')]],

    ['hatarçy', 'Ňurlyýew Aýdogdy Meretgulyýewiç', 'Ahal wel., Tejen ş.', '2004-12-05', 'II-2024ý', 'Ahal', 'Tejen ŞHW', B2, '2-nji rota', '2-nji bölüm',
      [ev('2025-08-21', 'Öýünde', 'Tejen', 'Türkmenistan', KINDS[2])],
      'Dowamly bronhit — öýde bejergi alan, 10 gün, häzir gözegçilikde.',
      'Maşgalasy doly, howandarlyk edýän ýakyn hossary ýok zerurlyk.',
      [concern('badHabits', 'Ýaramaz endikliler', 'Çilim çekmek endigi bar, lukman tarapyndan duýduryş berildi.')],
      ['Wzwod serkerdesi'],
      'daily',
      [action(daysAgo(0), 'Gündelik saglyk ýagdaýy barlanyldy, çilim çekmezlik boýunça söhbetdeşlik geçirildi.', 'Wzwod serkerdesi')]],

    ['seržant', 'Çaryýew Begenç Halmyradowiç', 'Aşgabat ş.', '2004-04-17', 'I-2024ý', 'Aşgabat', 'Köpetdag ŞHW', B2, '2-nji rota', '3-nji bölüm',
      [ev('2025-06-09', 'Şäher 1-nji hassahanasy', 'Aşgabat', 'Türkmenistan', KINDS[3])],
      'Bejergi teklip edildi, esger bejergiden ýüz öwürdi — gaýtadan maslahat berilmeli.',
      'Maşgalasy Aşgabatda, ýaşaýyş şertleri kadaly.',
      [concern('disciplineViolators', 'Tertip-düzgün bozýanlar', 'Buýruklara garşy çykyş etmek ýagdaýy bellendi.'), concern('badHabits', 'Ýaramaz endikliler', 'Içgi içmek ýagdaýy bir gezek bellendi.')],
      ['Rota serkerdesi', 'Batalýon serkerdesi'],
      'every3days',
      [action(daysAgo(3), 'Düzgün bozma boýunça komissiýa çagyryldy, düşündiriş alyndy.', 'Batalýon serkerdesi')]],

    ['hatarçy', 'Sähedow Şamuhammet Nazarowiç', 'Balkan wel., Serdar ş.', '2005-06-02', 'I-2025ý', 'Balkan', 'Serdar ŞHW', B3, '1-nji rota', '1-nji bölüm',
      [ev('2025-12-15', 'Serdar etrap hassahanasy', 'Serdar', 'Türkmenistan', KINDS[0])],
      'Sag aýagyň dabanynyň şikesi — operasiýadan soň dikeldiş dowam edýär.',
      'Maşgalasy doly, dikeldiş döwri üçin goldaw berýärler.',
      [concern('physicallyWeak', 'Fiziki taýdan gowşak', 'Şikesden soň agyr fiziki türgenleşiklerden wagtlaýyn çetleşdirildi.')],
      ['Harby bölümiň lukmançylyk gullugynyň müdiri'],
      'weekly',
      [action(daysAgo(1), 'Dikeldiş maşklarynyň barşy barlanyldy.', 'Harby bölümiň lukmançylyk gullugynyň müdiri')]],

    ['kiçi seržant', 'Ödeýew Ýusup Rejepowiç', 'Daşoguz wel., Köneürgenç ş.', '2005-10-28', 'II-2025ý', 'Daşoguz', 'Köneürgenç ŞHW', B3, '1-nji rota', '2-nji bölüm',
      [],
      'Saglyk ýagdaýy kadaly.',
      'Ejesi — Ödeýewa Bahar, 1982ý. — maýyplygy bar, esger ýeke ekleýji.',
      [concern('harshLivingConditions', 'Maşgalasynda ýaşaýyş-durmuş şertleri agyr bolanlar', 'Ejesiniň maýyplygy sebäpli maşgalanyň ýeke-täk ekleýjisi bolup durýar.')],
      ['RSTIBO', 'HBSTIBO'],
      'monthly',
      [action(daysAgo(3), 'Maşgala ýagdaýy boýunça durmuş kömegi teklip edildi.', 'RSTIBO')]],

    ['seržant', 'Meredow Döwran Şirmuhammedowiç', 'Lebap wel., Köýtendag etr.', '2004-02-11', 'I-2024ý', 'Lebap', 'Köýtendag EHW', B3, '2-nji rota', '1-nji bölüm',
      [ev('2025-04-27', 'Türkmenabat köpugurly hassahanasy', 'Türkmenabat', 'Türkmenistan', KINDS[1])],
      'Ganyň basyşynyň ýokarlanmagy — gözegçilikde, derman kabul edýär.',
      'Maşgalasy doly, ýaşaýyş şertleri kadaly.',
      [concern('policeRegistered', 'Polisiýa bellige alnanlar', 'Harby gullukdan öň administratiw düzgün bozma sebäpli bellige alnan.')],
      ['BSTIBO'],
      'every3days',
      []],

    ['uly seržant', 'Halylow Kakageldi Ýazgeldiýewiç', 'Mary wel., Baýramaly ş.', '2005-05-19', 'I-2025ý', 'Mary', 'Baýramaly ŞHW', B1, '2-nji rota', '2-nji bölüm',
      [ev('2026-02-08', 'Harby-lukmançylyk merkezi', 'Aşgabat', 'Türkmenistan', KINDS[2])],
      'Dowamly sinusit; öýde bejergi bilen dowam etdirildi, gözegçilikde.',
      'Maşgalasy doly, gatnaşyk yzygiderli.',
      [concern('adaptationDifficulty', 'Uýgunlaşmakda kynçylyk çekýänler', 'Täze topara uýgunlaşmakda kynçylyk çekýär, ýeke-täk özüni alyp barýar.')],
      ['Wzwod serkerdesi', 'Harby bölümiň psihology'],
      'biweekly',
      [action(daysAgo(2), 'Psiholog bilen söhbetdeşlik geçirildi, topar bilen işleşmek maslahat berildi.', 'Harby bölümiň psihology')]],
  ];
}

export function seedIfEmpty() {
  if (rowCount('soldiers') > 0) return;
  const raw = rawSeed();
  const now = Date.now();

  const insertSoldier = db.prepare(`
    INSERT INTO soldiers (id, rank, fullName, birthPlace, birthDate, callUpPeriod, commissariatRegion, commissariat, unit, company, platoon, diagnosis, familyNote, photo, orderNo, updatedAt, concerns, assignedPersonnel, actionFrequency, actionLog)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertEvent = db.prepare(`
    INSERT INTO medical_events (soldierId, sortIndex, date, facility, city, country, kind)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  raw.forEach((r, i) => {
    const [
      rank, fullName, birthPlace, birthDate, callUpPeriod, commissariatRegion, commissariat, unit, company, platoon,
      medicalEvents, diagnosis, familyNote, concerns, assignedPersonnel, actionFrequency, actionLog,
    ] = r;
    const id = uid();
    insertSoldier.run(
      id, rank, fullName, birthPlace, birthDate, callUpPeriod, commissariatRegion, commissariat, unit, company, platoon,
      diagnosis, familyNote, null, i + 1, now - i * 86400000,
      JSON.stringify(concerns), JSON.stringify(assignedPersonnel), actionFrequency, JSON.stringify(actionLog),
    );
    medicalEvents.forEach((e, j) => {
      insertEvent.run(id, j, e.date, e.facility, e.city, e.country, e.kind);
    });
  });
}
