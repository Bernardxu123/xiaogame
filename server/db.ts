import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'rabbit-care.db');

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS game_saves (
    id TEXT PRIMARY KEY,
    hunger REAL NOT NULL DEFAULT 80,
    cleanliness REAL NOT NULL DEFAULT 80,
    happiness REAL NOT NULL DEFAULT 80,
    is_dressed INTEGER NOT NULL DEFAULT 0,
    is_sleeping INTEGER NOT NULL DEFAULT 0,
    poops TEXT NOT NULL DEFAULT '[]',
    last_save_time INTEGER NOT NULL
  )
`);

export default db;
