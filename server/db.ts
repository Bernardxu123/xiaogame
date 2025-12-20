import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'rabbit-care.db');

const db = new Database(dbPath);

// Initialize database schema (v2 - Full Game State)
db.exec(`
  CREATE TABLE IF NOT EXISTS game_saves (
    id TEXT PRIMARY KEY,
    -- Core Stats (0-2 scale)
    hunger_level INTEGER NOT NULL DEFAULT 2,
    clean_level INTEGER NOT NULL DEFAULT 2,
    happy_level INTEGER NOT NULL DEFAULT 2,
    -- Progression
    hearts INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    total_hearts_earned INTEGER NOT NULL DEFAULT 0,
    -- Equipment & Inventory (JSON)
    equipment TEXT NOT NULL DEFAULT '{}',
    placed_items TEXT NOT NULL DEFAULT '[]',
    poops TEXT NOT NULL DEFAULT '[]',
    -- Backgrounds & Unlocks
    current_background TEXT NOT NULL DEFAULT 'room',
    unlocked_items TEXT NOT NULL DEFAULT '["default"]',
    unlocked_backgrounds TEXT NOT NULL DEFAULT '["room"]',
    -- Timestamps
    last_interaction INTEGER NOT NULL DEFAULT 0,
    last_gift_claimed INTEGER NOT NULL DEFAULT 0,
    last_save_time INTEGER NOT NULL
  )
`);

// Migration: Add new columns if they don't exist (for existing databases)
const columns = db.prepare("PRAGMA table_info(game_saves)").all() as { name: string }[];
const columnNames = columns.map(c => c.name);

const migrations = [
  { name: 'hunger_level', sql: "ALTER TABLE game_saves ADD COLUMN hunger_level INTEGER NOT NULL DEFAULT 2" },
  { name: 'clean_level', sql: "ALTER TABLE game_saves ADD COLUMN clean_level INTEGER NOT NULL DEFAULT 2" },
  { name: 'happy_level', sql: "ALTER TABLE game_saves ADD COLUMN happy_level INTEGER NOT NULL DEFAULT 2" },
  { name: 'hearts', sql: "ALTER TABLE game_saves ADD COLUMN hearts INTEGER NOT NULL DEFAULT 0" },
  { name: 'level', sql: "ALTER TABLE game_saves ADD COLUMN level INTEGER NOT NULL DEFAULT 1" },
  { name: 'total_hearts_earned', sql: "ALTER TABLE game_saves ADD COLUMN total_hearts_earned INTEGER NOT NULL DEFAULT 0" },
  { name: 'equipment', sql: "ALTER TABLE game_saves ADD COLUMN equipment TEXT NOT NULL DEFAULT '{}'" },
  { name: 'placed_items', sql: "ALTER TABLE game_saves ADD COLUMN placed_items TEXT NOT NULL DEFAULT '[]'" },
  { name: 'current_background', sql: "ALTER TABLE game_saves ADD COLUMN current_background TEXT NOT NULL DEFAULT 'room'" },
  { name: 'unlocked_items', sql: "ALTER TABLE game_saves ADD COLUMN unlocked_items TEXT NOT NULL DEFAULT '[\"default\"]'" },
  { name: 'unlocked_backgrounds', sql: "ALTER TABLE game_saves ADD COLUMN unlocked_backgrounds TEXT NOT NULL DEFAULT '[\"room\"]'" },
  { name: 'last_interaction', sql: "ALTER TABLE game_saves ADD COLUMN last_interaction INTEGER NOT NULL DEFAULT 0" },
  { name: 'last_gift_claimed', sql: "ALTER TABLE game_saves ADD COLUMN last_gift_claimed INTEGER NOT NULL DEFAULT 0" },
];

for (const migration of migrations) {
  if (!columnNames.includes(migration.name)) {
    try {
      db.exec(migration.sql);
      console.log(`[DB Migration] Added column: ${migration.name}`);
    } catch (e) {
      // Column might already exist in some edge cases
      console.warn(`[DB Migration] Skipped ${migration.name}:`, e);
    }
  }
}

export default db;
