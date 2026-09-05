import initSqlJs from 'sql.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The desktop app points this at a writable per-user folder (Electron's
// userData dir) since the install directory itself may not be writable.
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'registry.sqlite');

// Electron 22 is the final release line that runs on Windows 7/8/8.1, but
// its Node 16 runtime predates node:sqlite. sql.js keeps the same SQLite file
// format while avoiding native, architecture-specific add-ons in the x86 app.
const SQL = await initSqlJs({
  locateFile: (file) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file),
});
const sqlite = fs.existsSync(dbPath)
  ? new SQL.Database(fs.readFileSync(dbPath))
  : new SQL.Database();

function persist() {
  const tempPath = `${dbPath}.tmp`;
  const backupPath = `${dbPath}.backup`;
  fs.writeFileSync(tempPath, Buffer.from(sqlite.export()));

  if (!fs.existsSync(dbPath)) {
    fs.renameSync(tempPath, dbPath);
    return;
  }

  if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
  fs.renameSync(dbPath, backupPath);
  try {
    fs.renameSync(tempPath, dbPath);
    fs.unlinkSync(backupPath);
  } catch (error) {
    if (!fs.existsSync(dbPath) && fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, dbPath);
    }
    throw error;
  }
}

function query(sql, params, firstOnly) {
  const statement = sqlite.prepare(sql);
  try {
    statement.bind(params);
    const rows = [];
    while (statement.step()) {
      rows.push(statement.getAsObject());
      if (firstOnly) break;
    }
    return firstOnly ? rows[0] : rows;
  } finally {
    statement.free();
  }
}

export const db = {
  exec(sql) {
    sqlite.exec(sql);
    persist();
  },
  prepare(sql) {
    return {
      all(...params) {
        return query(sql, params, false);
      },
      get(...params) {
        return query(sql, params, true);
      },
      run(...params) {
        const statement = sqlite.prepare(sql);
        try {
          statement.bind(params);
          statement.step();
        } finally {
          statement.free();
        }
        const changes = sqlite.getRowsModified();
        persist();
        return { changes };
      },
    };
  },
};

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
