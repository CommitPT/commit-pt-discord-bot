import { Message, TextChannel } from 'discord.js';
import { logger } from '../logger';
import { checkAndActivateCooldown } from '../lib/cooldown';
import { db } from '../lib/database';
import { calculateProgress } from '../lib/levels';
import { assignProgrammerRole } from './guildMemberAdd';
import { queries } from '../queries/xp';
import { CHANNELS } from '../constants';

const MIN_WORDS = 2;
const MIN_WORD_LENGTH = 2;
const MAX_XP_PER_MESSAGE = 25;

function countValidWords(content: string): number {
  return content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length >= MIN_WORD_LENGTH).length;
}

export async function handleMessageCreate(message: Message): Promise<void> {
  if (message.author.bot || !message.member || !message.guildId) return;

  await assignProgrammerRole(message.member);

  const wordCount = countValidWords(message.content);

  if (wordCount < MIN_WORDS) {
    logger.debug(
      `[messageCreate] ${message.author.username} — message too short (${wordCount} words), no XP`,
    );
    return;
  }

  if (!checkAndActivateCooldown(message.author.id)) {
    logger.debug(`[messageCreate] ${message.author.username} — cooldown active, no XP`);
    return;
  }

  const xpGained = Math.min(wordCount, MAX_XP_PER_MESSAGE);

  logger.debug(
    `[messageCreate] ${message.author.username} gained ${xpGained} XP (${wordCount} words) in guild ${message.guildId}`,
  );

  const row = queries.getUserXp.get(message.author.id, message.guildId);

  const previousXp = row?.xp ?? 0;
  const newTotalXp = previousXp + xpGained;
  const { level: previousLevel } = calculateProgress(previousXp);
  const { level: newLevel } = calculateProgress(newTotalXp);

  queries.upsertUserActivity.run(message.author.id, message.guildId, newTotalXp, Date.now());

  const today = new Date().toISOString().slice(0, 10);
  db.prepare(
    `INSERT INTO message_stats (date, count) VALUES (?, 1)
    ON CONFLICT(date) DO UPDATE SET count = count + 1`,
  ).run(today);

  if (newLevel > previousLevel) {
    logger.success(`[messageCreate] ${message.author.username} leveled up to level ${newLevel}`);
    await sendLevelUpNotification(message, newLevel);
  }
}

async function sendLevelUpNotification(message: Message, newLevel: number): Promise<void> {
  const channel = message.client.channels.cache.get(CHANNELS.LEVELS);
  if (!channel?.isTextBased()) {
    logger.warn(`[messageCreate] Channel ${CHANNELS.LEVELS} not found or not text-based`);
    return;
  }

  await (channel as TextChannel).send(
    `🎉 <@${message.author.id}> acabou de atingir o **nível ${newLevel}**! Continua assim! 🚀`,
  );
}
