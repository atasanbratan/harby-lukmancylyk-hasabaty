import { db, rowCount } from './db.js';
import { randomUUID } from 'node:crypto';

const KINDS = ['Hassahanada bejergi alan', 'Barlagda bolan', 'Öýünde bejergi alan', 'Bejergi almadyk'];

function ev(date, facility, city, country, kind) {
  return { date, facility, city, country, kind };
}

function uid() {
  return 'r' + randomUUID().replace(/-/g, '').slice(0, 10);
}

function rawSeed() {
  const B1 = '1-nji tankçylyk batalýony', B2 = '2-nji motoatyjy batalýony', B3 = '3-nji aragatnaşyk batalýony';
  return [
    ['esger', 'Amanow Serdar Baýramowiç', 'Balkan wel., Balkanabat ş.', '2005-03-14', 'I-2025ý', 'Balkan', 'Balkanabat ŞHW', B1, '1-nji rota', '2-nji bölüm',
      [ev('2025-11-04', 'Balkanabat köpugurly hassahanasy', 'Balkanabat', 'Türkmenistan', KINDS[0])],
      'Aşgazan başynyň sowuklamasy (gastrit), 2025ý. noýabrda gaýtalanan.', ''],
    ['kiçi seržant', 'Gurbanow Merdan Atajanowiç', 'Daşoguz wel., Boldumsaz etr.', '2004-07-22', 'II-2024ý', 'Daşoguz', 'Boldumsaz EHW', B1, '1-nji rota', '3-nji bölüm',
      [ev('2025-02-18', 'Enäniň we çaganyň saglygyny goraýyş merkezi', 'Daşoguz', 'Türkmenistan', KINDS[1])],
      'Gözüň görüş ýitiligi barlanyldy — çäklendirme ýok.', ''],
    ['esger', 'Şyhyýew Nurmuhammet Döwletgeldiýewiç', 'Lebap wel., Türkmenabat ş.', '2005-01-09', 'I-2025ý', 'Lebap', 'Türkmenabat ŞHW', B1, '2-nji rota', '1-nji bölüm',
      [],
      '', 'Kakasy — Şyhyýew Döwletgeldi, 1978ý. — 2019ý. iş kesilen, häzir azatlykda. Ejesi bilen ýaşaýar.'],
    ['esger', 'Ýazmyradow Kerim Öwezowiç', 'Mary wel., Ýolöten etr.', '2005-09-30', 'II-2025ý', 'Mary', 'Ýolöten EHW', B2, '1-nji rota', '1-nji bölüm',
      [ev('2026-01-12', 'Acıbadem hassahanasy', 'Istanbul', 'Türkiýe', KINDS[0]), ev('2026-03-02', 'Harby-lukmançylyk merkezi', 'Aşgabat', 'Türkmenistan', KINDS[1])],
      'Ýürek gapajygynyň dogabitdi kemçiligi — daşary ýurtda operasiýa edildi.', ''],
    ['esger', 'Ňurlyýew Aýdogdy Meretgulyýewiç', 'Ahal wel., Tejen ş.', '2004-12-05', 'II-2024ý', 'Ahal', 'Tejen ŞHW', B2, '2-nji rota', '2-nji bölüm',
      [ev('2025-08-21', 'Öýünde', 'Tejen', 'Türkmenistan', KINDS[2])],
      'Dowamly bronhit — öýde bejergi alan, 10 gün.', ''],
    ['seržant', 'Çaryýew Begenç Halmyradowiç', 'Aşgabat ş.', '2004-04-17', 'I-2024ý', 'Aşgabat', 'Köpetdag ŞHW', B2, '2-nji rota', '3-nji bölüm',
      [ev('2025-06-09', 'Şäher 1-nji hassahanasy', 'Aşgabat', 'Türkmenistan', KINDS[3])],
      'Bejergi teklip edildi, esger bejergiden ýüz öwürdi.', ''],
    ['esger', 'Sähedow Şamuhammet Nazarowiç', 'Balkan wel., Serdar ş.', '2005-06-02', 'I-2025ý', 'Balkan', 'Serdar ŞHW', B3, '1-nji rota', '1-nji bölüm',
      [ev('2025-12-15', 'Serdar etrap hassahanasy', 'Serdar', 'Türkmenistan', KINDS[0])],
      'Sag aýagyň dabanynyň şikesi — operasiýadan soň dikeldiş.', ''],
    ['esger', 'Ödeýew Ýusup Rejepowiç', 'Daşoguz wel., Köneürgenç ş.', '2005-10-28', 'II-2025ý', 'Daşoguz', 'Köneürgenç ŞHW', B3, '1-nji rota', '2-nji bölüm',
      [], '', 'Ejesi — Ödeýewa Bahar, 1982ý. — maýyplygy bar, esger ýeke ekleýji.'],
    ['kiçi seržant', 'Meredow Döwran Şirmuhammedowiç', 'Lebap wel., Köýtendag etr.', '2004-02-11', 'I-2024ý', 'Lebap', 'Köýtendag EHW', B3, '2-nji rota', '1-nji bölüm',
      [ev('2025-04-27', 'Türkmenabat köpugurly hassahanasy', 'Türkmenabat', 'Türkmenistan', KINDS[1])],
      'Ganyň basyşynyň ýokarlanmagy — gözegçilikde.', ''],
    ['esger', 'Halylow Kakageldi Ýazgeldiýewiç', 'Mary wel., Baýramaly ş.', '2005-05-19', 'I-2025ý', 'Mary', 'Baýramaly ŞHW', B1, '2-nji rota', '2-nji bölüm',
      [ev('2026-02-08', 'Harby-lukmançylyk merkezi', 'Aşgabat', 'Türkmenistan', KINDS[2])],
      'Dowamly sinusit; öýde bejergi bilen dowam etdirildi.', '']
  ];
}

export function seedIfEmpty() {
  if (rowCount('soldiers') > 0) return;
  const raw = rawSeed();
  const now = Date.now();

  const insertSoldier = db.prepare(`
    INSERT INTO soldiers (id, rank, fullName, birthPlace, birthDate, callUpPeriod, commissariatRegion, commissariat, unit, company, platoon, diagnosis, familyNote, photo, orderNo, updatedAt, concerns, assignedPersonnel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertEvent = db.prepare(`
    INSERT INTO medical_events (soldierId, sortIndex, date, facility, city, country, kind)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  raw.forEach((r, i) => {
    const [rank, fullName, birthPlace, birthDate, callUpPeriod, commissariatRegion, commissariat, unit, company, platoon, medicalEvents, diagnosis, familyNote] = r;
    const id = uid();
    insertSoldier.run(id, rank, fullName, birthPlace, birthDate, callUpPeriod, commissariatRegion, commissariat, unit, company, platoon, diagnosis, familyNote, null, i + 1, now - i * 86400000, '[]', '[]');
    medicalEvents.forEach((e, j) => {
      insertEvent.run(id, j, e.date, e.facility, e.city, e.country, e.kind);
    });
  });
}
