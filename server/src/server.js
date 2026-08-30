import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { db } from './db.js';
import { seedIfEmpty } from './seed.js';
import { login, logout, requireAuth } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); // photos travel as base64 data URLs

// Plain text columns, copied through as-is.
const SOLDIER_TEXT_COLUMNS = [
  'rank', 'fullName', 'birthPlace', 'birthDate', 'callUpPeriod',
  'commissariatRegion', 'commissariat', 'unit', 'company', 'platoon',
  'diagnosis', 'familyNote', 'photo', 'actionFrequency',
];
// JSON columns — arrays on the wire, TEXT in SQLite.
const SOLDIER_JSON_COLUMNS = ['concerns', 'assignedPersonnel', 'actionLog'];
const SOLDIER_COLUMNS = [...SOLDIER_TEXT_COLUMNS, ...SOLDIER_JSON_COLUMNS];

function uid() {
  return 'r' + randomUUID().replace(/-/g, '').slice(0, 10);
}

function nextOrderNo() {
  const r = db.prepare('SELECT MAX(orderNo) AS m FROM soldiers').get();
  return (r.m || 0) + 1;
}

function eventsForSoldier(id) {
  return db.prepare(
    'SELECT date, facility, city, country, kind FROM medical_events WHERE soldierId = ? ORDER BY sortIndex ASC'
  ).all(id);
}

function parseJsonColumn(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToSoldier(row) {
  return {
    ...row,
    concerns: parseJsonColumn(row.concerns),
    assignedPersonnel: parseJsonColumn(row.assignedPersonnel),
    actionLog: parseJsonColumn(row.actionLog),
    medicalEvents: eventsForSoldier(row.id),
  };
}

function listSoldiers() {
  const rows = db.prepare('SELECT * FROM soldiers').all();
  return rows.map(rowToSoldier);
}

function getSoldier(id) {
  const row = db.prepare('SELECT * FROM soldiers WHERE id = ?').get(id);
  return row ? rowToSoldier(row) : null;
}

function replaceEvents(id, events) {
  db.prepare('DELETE FROM medical_events WHERE soldierId = ?').run(id);
  const insert = db.prepare(
    'INSERT INTO medical_events (soldierId, sortIndex, date, facility, city, country, kind) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  (events || []).forEach((e, i) => {
    insert.run(id, i, e.date || '', e.facility || '', e.city || '', e.country || '', e.kind || '');
  });
}

function valueFor(col, body) {
  if (SOLDIER_JSON_COLUMNS.includes(col)) {
    return JSON.stringify(Array.isArray(body[col]) ? body[col] : []);
  }
  return body[col] ?? '';
}

// -- Auth --------------------------------------------------------------

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const token = login(username, password);
  if (!token) return res.status(401).json({ error: 'Ulanyjy ady ýa-da parol nädogry.' });
  res.json({ token, username });
});

app.post('/api/logout', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) logout(token);
  res.json({ ok: true });
});

// -- Soldiers (all routes below require a valid session) ---------------

app.use('/api/soldiers', requireAuth);

app.get('/api/soldiers', (req, res) => {
  res.json(listSoldiers());
});

app.get('/api/soldiers/:id', (req, res) => {
  const soldier = getSoldier(req.params.id);
  if (!soldier) return res.status(404).json({ error: 'Ýazgy tapylmady' });
  res.json(soldier);
});

app.post('/api/soldiers', (req, res) => {
  const body = req.body || {};
  if (!body.fullName || !body.birthDate) {
    return res.status(400).json({ error: 'F.A.Aa we doglan senesi hökmany.' });
  }
  const id = body.id && !getSoldier(body.id) ? body.id : uid();
  const now = Date.now();
  const orderNo = Number.isFinite(body.orderNo) && body.orderNo > 0 ? body.orderNo : nextOrderNo();
  const values = SOLDIER_COLUMNS.map((c) => valueFor(c, body));
  db.prepare(
    `INSERT INTO soldiers (id, ${SOLDIER_COLUMNS.join(', ')}, orderNo, updatedAt) VALUES (?, ${SOLDIER_COLUMNS.map(() => '?').join(', ')}, ?, ?)`
  ).run(id, ...values, orderNo, now);
  replaceEvents(id, body.medicalEvents);
  res.status(201).json(getSoldier(id));
});

app.put('/api/soldiers/:id', (req, res) => {
  const existing = getSoldier(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Ýazgy tapylmady' });
  const body = req.body || {};
  if (!body.fullName || !body.birthDate) {
    return res.status(400).json({ error: 'F.A.Aa we doglan senesi hökmany.' });
  }
  const now = Date.now();
  // orderNo isn't user-editable from the form — keep whatever the record already had.
  const values = SOLDIER_COLUMNS.map((c) => valueFor(c, body));
  db.prepare(
    `UPDATE soldiers SET ${SOLDIER_COLUMNS.map((c) => `${c} = ?`).join(', ')}, updatedAt = ? WHERE id = ?`
  ).run(...values, now, req.params.id);
  replaceEvents(req.params.id, body.medicalEvents);
  res.json(getSoldier(req.params.id));
});

app.delete('/api/soldiers/:id', (req, res) => {
  const existing = getSoldier(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Ýazgy tapylmady' });
  db.prepare('DELETE FROM medical_events WHERE soldierId = ?').run(req.params.id);
  db.prepare('DELETE FROM soldiers WHERE id = ?').run(req.params.id);
  res.json({ ok: true, deleted: existing });
});

// -- Built frontend ------------------------------------------------------
// In dev, Vite serves the frontend on :5173 and proxies /api here, so
// client/dist doesn't exist and this block is a no-op. In the packaged
// desktop app (and any plain production deploy), client/dist is built
// ahead of time and this server becomes the single process serving both
// the SPA and the API on one origin — which is also why the frontend can
// keep using relative fetch('/api/...') unchanged in every environment.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Aýratyn gözegçilikde saklamak API listening on http://localhost:${PORT}`);
});
