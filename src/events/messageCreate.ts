import { Message } from 'discord.js';
// import { logger } from '../logger';
import { db } from '../lib/database';
import { verificarEAtivarDelay } from './delayxp';

export async function handleMessageCreate(message: Message): Promise<void> {
  if (message.author.bot || !message.member) return;

  if (!verificarEAtivarDelay(message.author.id)) return; // se nao tiver delay passa e gaanha xp caso contrario acaaba aqui

  const xpGanho = Math.floor(Math.random() * 11) + 15;

  // logger.debug(`[messageCreate] ${message.author.tag} sent a message in #${message.channel.id}`);

  //   await assignProgrammerRole(message.member);

  db.prepare(
    `
      INSERT INTO user_xp (user_id, guild_id, xp, level)
      VALUES ( ?,?,?,1)
      ON CONFLICT(user_id,guild_id) DO UPDATE SET xp= xp + ?
  
  `,
  ).run(message.author.id, message.guild?.id, xpGanho, xpGanho);
} // de acordo com o id do usuario e da guilda vamos adicionar o xp ganho ao anterior e aumentar o level caso chegue ao limite do nivel anterior
