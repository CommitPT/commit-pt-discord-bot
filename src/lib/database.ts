import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { logger } from '../logger';

const dbPath = join(process.cwd(), 'data', 'database.db');

mkdirSync(join(process.cwd(), 'data'), { recursive: true });

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_xp (
    user_id  TEXT    NOT NULL,
    guild_id TEXT    NOT NULL,
    xp       INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, guild_id)
  )
`);

// Safe migration — ignored if column already exists
try {
  db.exec(`ALTER TABLE user_xp ADD COLUMN last_message_at INTEGER`);
} catch {
  // column already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS invite_tracker (
    guild_id    TEXT    NOT NULL,
    inviter_id  TEXT    NOT NULL,
    invitee_id  TEXT    NOT NULL,
    invite_code TEXT    NOT NULL,
    joined_at   INTEGER NOT NULL
  )
`);

// Safe migration: deduplicate and add unique index on (guild_id, invitee_id)
try {
  db.exec(`
    DELETE FROM invite_tracker
    WHERE rowid NOT IN (
      SELECT MAX(rowid)
      FROM invite_tracker
      GROUP BY guild_id, invitee_id
    )
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_invite_tracker_unique
    ON invite_tracker (guild_id, invitee_id)
  `);
} catch {
  // index already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS ticket_counter (
    id      INTEGER PRIMARY KEY CHECK (id = 1),
    counter INTEGER DEFAULT 0
  )
`);

db.prepare(`INSERT OR IGNORE INTO ticket_counter (id, counter) VALUES (1, 0)`).run();

db.exec(`
  CREATE TABLE IF NOT EXISTS message_stats (
    date  TEXT    PRIMARY KEY,
    count INTEGER DEFAULT 0
  )
`);

// Seed historical message count on first run
const today = new Date().toISOString().slice(0, 10);
db.prepare(
  `
  INSERT INTO message_stats (date, count) VALUES (?, 83278)
  ON CONFLICT(date) DO NOTHING
`,
).run(today);

db.exec(`
  CREATE TABLE IF NOT EXISTS resolved_tickets (
    id      INTEGER PRIMARY KEY CHECK (id = 1),
    counter INTEGER DEFAULT 0
  )
`);
db.prepare(`INSERT OR IGNORE INTO resolved_tickets (id, counter) VALUES (1, 0)`).run();

db.exec(`
  CREATE TABLE IF NOT EXISTS member_joins (
    user_id   TEXT    NOT NULL,
    guild_id  TEXT    NOT NULL,
    joined_at INTEGER NOT NULL
  )
`);

logger.success(`[database] SQLite ready at ${dbPath}`);
