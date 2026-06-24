import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { logger } from '../logger';

const COMMIT_PLUS_ROLE_ID = '1514004224889983026';

export async function handleGuildMemberUpdate(
  oldMember: GuildMember,
  newMember: GuildMember,
): Promise<void> {
  const hadRole = oldMember.roles.cache.has(COMMIT_PLUS_ROLE_ID);
  const hasRole = newMember.roles.cache.has(COMMIT_PLUS_ROLE_ID);

  if (hadRole || !hasRole) return;

  logger.info(
    `[guildMemberUpdate] ${newMember.user.tag} received Commit+ role in "${newMember.guild.name}"`,
  );

  const channelId = process.env.WELCOME_CHANNEL_ID;

  if (!channelId) {
    logger.warn('[guildMemberUpdate] WELCOME_CHANNEL_ID is not set in .env');
    return;
  }

  const channel = newMember.guild.channels.cache.get(channelId);

  if (!channel || !channel.isTextBased()) {
    logger.warn(
      `[guildMemberUpdate] Welcome channel ${channelId} not found or is not a text channel`,
    );
    return;
  }

  logger.info(
    `[guildMemberUpdate] Sending Commit+ announcement for ${newMember.user.tag} to #${channel.name}`,
  );

  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setDescription(`🎉 ${newMember} acabou de receber o cargo **Commit+**!`)
    .setThumbnail(newMember.user.displayAvatarURL())
    .setTimestamp();

  await (channel as TextChannel).send({ embeds: [embed] });
}
