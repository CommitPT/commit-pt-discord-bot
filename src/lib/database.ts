import Database from 'better-sqlite3';
import { join } from 'path';
import { logger } from '../logger';

const dbPath = join(process.cwd(), 'database.db');

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_xp (
    user_id  TEXT    NOT NULL,
    guild_id TEXT    NOT NULL,
    xp       INTEGER DEFAULT 0,
    level    INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, guild_id)
  )
`);

logger.success(`[database] SQLite ready at ${dbPath}`);
