import { db } from '../lib/database';

export interface UserXpRow {
  user_id: string;
  guild_id: string;
  xp: number;
  level: number;
}

export const queries = {
  getUserXp: db.prepare<[string, string], UserXpRow>(
    'SELECT xp, level FROM user_xp WHERE user_id = ? AND guild_id = ?',
  ),

  upsertUserXp: db.prepare<[string, string, number, number, number, number]>(`
    INSERT INTO user_xp (user_id, guild_id, xp, level)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, guild_id) DO UPDATE SET xp = ?, level = ?
  `),
};
