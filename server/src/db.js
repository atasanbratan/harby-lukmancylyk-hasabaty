import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The desktop app points this at a writable per-user folder (Electron's
// userData dir) since the install directory itself may not be writable.
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'registry.sqlite');

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS soldiers (
    id TEXT PRIMARY KEY,
    rank TEXT DEFAULT '',
    fullName TEXT NOT NULL,
    birthPlace TEXT DEFAULT '',
    birthDate TEXT NOT NULL,
    callUpPeriod TEXT DEFAULT '',
    commissariatRegion TEXT DEFAULT '',
    commissariat TEXT DEFAULT '',
    unit TEXT DEFAULT '',
    company TEXT DEFAULT '',
    platoon TEXT DEFAULT '',
    diagnosis TEXT DEFAULT '',
    familyNote TEXT DEFAULT '',
    photo TEXT,
    orderNo INTEGER DEFAULT 0,
    updatedAt INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS medical_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    soldierId TEXT NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
    sortIndex INTEGER DEFAULT 0,
    date TEXT DEFAULT '',
    facility TEXT DEFAULT '',
    city TEXT DEFAULT '',
    country TEXT DEFAULT '',
    kind TEXT DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS idx_medical_events_soldier ON medical_events(soldierId);
`);

// Foreign-key cascades need to be turned on explicitly per connection.
db.exec('PRAGMA foreign_keys = ON');

// Lightweight migration: add columns introduced after the initial release
// without wiping existing databases.
const existingColumns = new Set(
  db.prepare('PRAGMA table_info(soldiers)').all().map((c) => c.name)
);
if (!existingColumns.has('concerns')) {
  db.exec("ALTER TABLE soldiers ADD COLUMN concerns TEXT DEFAULT '[]'");
}
if (!existingColumns.has('assignedPersonnel')) {
  db.exec("ALTER TABLE soldiers ADD COLUMN assignedPersonnel TEXT DEFAULT '[]'");
}
if (!existingColumns.has('actionFrequency')) {
  db.exec("ALTER TABLE soldiers ADD COLUMN actionFrequency TEXT DEFAULT ''");
}
if (!existingColumns.has('actionLog')) {
  db.exec("ALTER TABLE soldiers ADD COLUMN actionLog TEXT DEFAULT '[]'");
}

export function rowCount(table) {
  const r = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get();
  return r.n;
}
